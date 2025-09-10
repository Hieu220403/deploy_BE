import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import Restaurant from '~/models/database/Restaurant.schema'
import { CreateRestaurantRequest, GetRestaurantsRequest } from '~/requests/restaurant.request'
import { Media } from '~/type'
import databaseServices from './database.services'
import { deleteImageFromS3 } from '~/utils/s3-bucket'
config()

type RequiredPageLimit = Required<Pick<GetRestaurantsRequest, 'page' | 'limit'>>
class RestaurantServices {
  async getList({
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    rating
  }: GetRestaurantsRequest & RequiredPageLimit): Promise<{
    restaurants: Restaurant[]
    total: number
  }> {
    const reqRestaurant = databaseServices.restaurants
      .aggregate([
        {
          $match: {
            ...(search ? { name: { $regex: search, $options: 'i' } } : {}),
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
          $sort: {
            [String(sortBy)]: sortOrder?.toLowerCase() === 'asc' ? 1 : -1
          }
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'restaurant_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'menus',
            localField: '_id',
            foreignField: 'restaurant_id',
            as: 'menus'
          }
        }
      ])
      .toArray()

    const reqCountTotal = databaseServices.restaurants.countDocuments({
      ...(search ? { name: { $regex: search, $options: 'i' } } : {}),
      ...(rating
        ? {
            rating: {
              $gte: +rating,
              $lt: rating !== 5 ? +rating + 1 : 5
            }
          }
        : {})
    })

    const [restaurants, total] = await Promise.all([reqRestaurant, reqCountTotal])

    return {
      restaurants: (restaurants as Restaurant[]) || [],
      total: total || 0
    }
  }

  async getDetail(restaurant_id: string): Promise<Restaurant | null> {
    const restaurant = await databaseServices.restaurants
      .aggregate([
        {
          $match: {
            _id: new ObjectId(restaurant_id)
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'restaurant_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'menus',
            localField: '_id',
            foreignField: 'restaurant_id',
            as: 'menus'
          }
        }
      ])
      .toArray()

    return (restaurant[0] as Restaurant) || null
  }

  async create({
    name,
    avatar,
    description,
    address,
    phone_number,
    website,
    media,
    weekly_opening_hours,
    special_opening_days
  }: CreateRestaurantRequest): Promise<Restaurant> {
    const result = await databaseServices.restaurants.insertOne(
      new Restaurant({
        name,
        avatar,
        description,
        address,
        phone_number,
        website,
        media,
        rating: 0,
        total_reviews: 0,
        weekly_opening_hours,
        special_opening_days
      })
    )
    const newRestaurant = await databaseServices.restaurants.findOne({
      _id: result.insertedId
    })
    return newRestaurant as Restaurant
  }

  async deleteRestaurant(restaurantId: string): Promise<boolean> {
    const restaurant = await databaseServices.restaurants.findOne({ _id: new ObjectId(restaurantId) })
    if (restaurant && restaurant.media) {
      await Promise.all(restaurant.media.map((item: Media) => deleteImageFromS3(item.url)))
    }
    const result = await databaseServices.restaurants.deleteOne({ _id: new ObjectId(restaurantId) })
    return result.deletedCount === 1
  }

  async getFeaturedRestaurants(): Promise<Restaurant[]> {
    const restaurants = await databaseServices.restaurants
      .aggregate([
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'restaurant_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'menus',
            localField: '_id',
            foreignField: 'restaurant_id',
            as: 'menus'
          }
        }
      ])
      .sort({ rating: -1 })
      .limit(10)
      .toArray()
    return (restaurants as Restaurant[]) || []
  }

  async updateRestaurant(restaurant_id: string, data: Partial<CreateRestaurantRequest>): Promise<Restaurant | null> {
    const result = await databaseServices.restaurants.updateOne(
      { _id: new ObjectId(restaurant_id) },
      { $set: { ...data } }
    )
    if (result.modifiedCount === 0) return null
    return this.getDetail(restaurant_id)
  }
}
export default new RestaurantServices()
