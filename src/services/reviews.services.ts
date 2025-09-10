import { ObjectId } from 'mongodb'
import Review from '~/models/database/Review.schema'
import { CreateReviewRequest, GetReviewsRequest } from '~/requests/review.requests'
import databaseServices from './database.services'
import { Media } from '~/type'
import { deleteImageFromS3 } from '~/utils/s3-bucket'

class ReviewServices {
  async getReviews({
    page,
    limit,
    sortBy,
    sortOrder,
    rating
  }: GetReviewsRequest): Promise<{ reviews: Review[]; total: number }> {
    const reqReviews = databaseServices.reviews
      .aggregate([
        {
          $match: {
            ...(rating
              ? {
                  rating: {
                    $gte: +rating,
                    $lt: rating !== 5 ? +rating + 1 : 5
                  }
                }
              : {})
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  name: 1,
                  avatar: 1,
                  username: 1
                }
              }
            ]
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            user_id: 0
          }
        },
        {
          $sort: { [sortBy!]: sortOrder === 'asc' || 'ASC' ? 1 : -1 }
        },
        {
          $skip: (page! - 1) * limit!
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    const reqTotalReviews = databaseServices.reviews.countDocuments({
      ...(rating
        ? {
            rating: {
              $gte: +rating,
              $lt: rating !== 5 ? +rating + 1 : 5
            }
          }
        : {})
    })
    const [reviews, total] = await Promise.all([reqReviews, reqTotalReviews])
    return {
      reviews: (reviews as Review[]) || [],
      total: total || 0
    }
  }
  async getReviewsByRestaurant({
    restaurant_id,
    page,
    limit,
    sortBy,
    sortOrder,
    rating
  }: GetReviewsRequest & { restaurant_id: string }): Promise<{ reviews: Review[]; total: number }> {
    const reqReviews = databaseServices.reviews
      .aggregate([
        {
          $match: {
            restaurant_id: new ObjectId(restaurant_id),
            ...(rating
              ? {
                  rating: {
                    $gte: +rating,
                    $lt: rating !== 5 ? +rating + 1 : 5
                  }
                }
              : {})
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  name: 1,
                  avatar: 1,
                  username: 1
                }
              }
            ]
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            user_id: 0
          }
        },
        {
          $sort: { [sortBy!]: sortOrder === 'asc' || 'ASC' ? 1 : -1 }
        },
        {
          $skip: (page! - 1) * limit!
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    const reqTotalReviews = databaseServices.reviews.countDocuments({
      restaurant_id: new ObjectId(restaurant_id),
      ...(rating
        ? {
            rating: {
              $gte: +rating,
              $lt: rating !== 5 ? +rating + 1 : 5
            }
          }
        : {})
    })
    const [reviews, total] = await Promise.all([reqReviews, reqTotalReviews])
    return {
      reviews: (reviews as Review[]) || [],
      total: total || 0
    }
  }

  async getReviewsRecent(): Promise<{ reviews: Review[] }> {
    const reviews = await databaseServices.reviews
      .aggregate([
        {
          $sort: { created_at: -1 }
        },
        {
          $limit: 10
        },
        {
          $lookup: {
            from: 'restaurants',
            localField: 'restaurant_id',
            foreignField: '_id',
            as: 'restaurant',
            pipeline: [
              {
                $project: {
                  name: 1,
                  avatar: 1,
                  username: 1
                }
              }
            ]
          }
        },
        {
          $unwind: { path: '$restaurant', preserveNullAndEmptyArrays: true }
        },
        // Join với users
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  name: 1,
                  avatar: 1,
                  username: 1
                }
              }
            ]
          }
        },
        {
          $unwind: { path: '$user', preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            user_id: 0,
            restaurant_id: 0
          }
        }
      ])
      .toArray()

    return { reviews: (reviews as Review[]) || [] }
  }

  async createReview({ user_id, restaurant_id, content, rating, media }: CreateReviewRequest): Promise<Review> {
    const result = await databaseServices.reviews.insertOne(
      new Review({
        user_id: new ObjectId(user_id),
        restaurant_id: new ObjectId(restaurant_id),
        rating,
        content,
        media: media || []
      })
    )
    const restaurant = await databaseServices.restaurants.findOne({ _id: new ObjectId(restaurant_id) })

    if (restaurant) {
      const newTotal = restaurant.total_reviews + 1
      const newAvgRating = (restaurant.rating || 0 * restaurant.total_reviews + rating) / newTotal
      await databaseServices.restaurants.updateOne(
        { _id: new ObjectId(restaurant_id) },
        {
          $set: { rating: Number(newAvgRating.toFixed(1)) },
          $inc: { total_reviews: 1 }
        }
      )
    }
    const review = await databaseServices.reviews
      .aggregate([
        { $match: { _id: result.insertedId } },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  name: 1,
                  avatar: 1,
                  username: 1
                }
              }
            ]
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            user_id: 0
          }
        }
      ])
      .toArray()

    return review[0] as Review
  }

  async updateReview({
    review_id,
    user_id,
    rating,
    content,
    media
  }: Partial<CreateReviewRequest> & { review_id: string; user_id: string }): Promise<Review | null> {
    const result = await databaseServices.reviews.updateOne(
      { _id: new ObjectId(review_id), user_id: new ObjectId(user_id) },
      {
        $set: {
          rating,
          content,
          media: media || []
        },
        $currentDate: { updatedAt: true }
      }
    )
    if (result.modifiedCount === 0) return null
    return databaseServices.reviews.findOne({ _id: new ObjectId(review_id) })
  }

  async deleteReview({ review_id }: { review_id: string }): Promise<boolean> {
    const review = await databaseServices.reviews.findOne({
      _id: new ObjectId(review_id)
    })
    const restaurant = await databaseServices.restaurants.findOne({ _id: review?.restaurant_id })
    if (restaurant && review) {
      if (review.media) {
        await Promise.all(review.media.map((item: Media) => deleteImageFromS3(item.url)))
      }
      const newTotal = restaurant.total_reviews - 1
      let newAvgRating = 0
      if (newTotal > 0) {
        newAvgRating = (restaurant.rating * restaurant.total_reviews - review.rating) / newTotal
      }
      const [result] = await Promise.all([
        await databaseServices.reviews.deleteOne({ _id: new ObjectId(review_id) }),
        await databaseServices.restaurants.updateOne(
          { _id: restaurant._id },
          {
            $set: { rating: Number(newAvgRating.toFixed(1)) },
            $inc: { total_reviews: -1 }
          }
        )
      ])
      return result.deletedCount === 1
    }
    return false
  }
  async getUserReviews({
    user_id,
    page,
    limit,
    sortBy,
    sortOrder
  }: {
    user_id: string
    page: number
    limit: number
    sortBy: string
    sortOrder: string
  }): Promise<{
    reviews: Review[]
    total: number
  }> {
    const reqReviews = databaseServices.reviews
      .aggregate<Review>([
        {
          $match: {
            user_id: new ObjectId(user_id)
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  name: 1,
                  avatar: 1,
                  username: 1
                }
              }
            ]
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            user_id: 0
          }
        },
        {
          $sort: { [sortBy]: sortOrder === 'asc' || 'ASC' ? 1 : -1 }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    const reqTotalReviews = databaseServices.reviews.countDocuments({
      user_id: new ObjectId(user_id)
    })
    const [reviews, total] = await Promise.all([reqReviews, reqTotalReviews])
    return {
      reviews: (reviews as Review[]) || [],
      total: total || 0
    }
  }
}
export default new ReviewServices()
