import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserI } from '~/models/database/User.schema'
import { GetReviewsRequest } from '~/requests/review.requests'
import reviewsServices from '~/services/reviews.services'
import { uploadFileToS3 } from '~/utils/s3-bucket'

class ReviewControllers {
  async getReviews(req: Request<ParamsDictionary, any, GetReviewsRequest>, res: Response, next: NextFunction) {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', rating } = req.query as GetReviewsRequest
    const { reviews, total } = await reviewsServices.getReviews({
      page,
      limit,
      sortBy,
      sortOrder,
      rating
    })
    return res.status(HTTP_STATUS.OK).json({
      data: reviews,
      pagination: {
        page: +page,
        limit: +limit,
        total
      }
    })
  }
  async getReviewsByRestaurant(
    req: Request<ParamsDictionary, any, GetReviewsRequest>,
    res: Response,
    next: NextFunction
  ) {
    const { restaurant_id } = req.params
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', rating } = req.query as GetReviewsRequest
    const { reviews, total } = await reviewsServices.getReviewsByRestaurant({
      restaurant_id,
      page: +page,
      limit: +limit,
      sortBy,
      sortOrder,
      rating
    })
    return res.status(HTTP_STATUS.OK).json({
      data: reviews,
      pagination: {
        page: +page,
        limit: +limit,
        total
      }
    })
  }
  async getReviewsRecent(req: Request, res: Response, next: NextFunction) {
    const { reviews } = await reviewsServices.getReviewsRecent()
    return res.status(HTTP_STATUS.OK).json({
      data: reviews
    })
  }
  async uploadReviewFile(req: Request, res: Response, next: NextFunction) {
    const { restaurant_id } = req.params
    const params = {
      Bucket: process.env.AWS_BUCKET as string,
      ContentType: req.file?.mimetype,
      Key: `reviews/restaurants-${restaurant_id}-${req.file?.filename}`,
      Body: req.file?.buffer
    }
    const result = await uploadFileToS3(params)
    return res.status(HTTP_STATUS.OK).json({
      data: result
    })
  }
  async createReview(req: Request, res: Response, next: NextFunction) {
    const { restaurant_id } = req.params
    const { user_id, rating, content, media } = req.body
    const newReview = await reviewsServices.createReview({
      user_id,
      restaurant_id,
      rating,
      content,
      media
    })
    return res.status(HTTP_STATUS.CREATED).json({
      data: newReview
    })
  }
  async updateReview(req: Request, res: Response, next: NextFunction) {
    const { review_id } = req.params
    const { user_id, rating, content, media } = req.body
    const updatedReview = await reviewsServices.updateReview({
      review_id,
      user_id,
      rating,
      content,
      media
    })
    return res.status(HTTP_STATUS.OK).json({
      data: updatedReview
    })
  }
  async deleteReview(req: Request, res: Response, next: NextFunction) {
    const { review_id } = req.params
    const result = await reviewsServices.deleteReview({ review_id })

    return res.status(HTTP_STATUS.NOT_FOUND).json({
      data: result
    })
  }
  async getUserReviews(req: Request<{ user_id: string }, GetReviewsRequest, any>, res: Response, next: NextFunction) {
    const { user_id } = req.params
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query as GetReviewsRequest
    const { reviews, total } = await reviewsServices.getUserReviews({ user_id, page, limit: +limit, sortBy, sortOrder })
    return res.status(HTTP_STATUS.OK).json({
      data: reviews,
      pagination: {
        page: +page,
        limit: +limit,
        total
      }
    })
  }
}
export default new ReviewControllers()
