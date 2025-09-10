import { uploadFileToS3 } from '~/utils/s3-bucket'
import { config } from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { RESTAURANT_MESSAGES } from '~/constants/message'
import { CreateRestaurantRequest, GetRestaurantParams, GetRestaurantsRequest } from '~/requests/restaurant.request'
import restaurantsServices from '~/services/restaurants.services'
config()
class RestaurantControllers {
  async getRestaurants(req: Request<ParamsDictionary, any, GetRestaurantsRequest>, res: Response, next: NextFunction) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search = '',
      rating
    } = req.query as GetRestaurantsRequest
    const { restaurants, total } = await restaurantsServices.getList({
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
      search,
      rating
    })
    return res.status(HTTP_STATUS.OK).json({
      data: restaurants,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    })
  }

  async getRestaurantDetail(req: Request<GetRestaurantParams, any, any>, res: Response, next: NextFunction) {
    const { restaurant_id } = req.params
    const restaurant = await restaurantsServices.getDetail(restaurant_id)
    return res.status(HTTP_STATUS.OK).json({
      data: restaurant
    })
  }
  async createRestaurant(
    req: Request<ParamsDictionary, any, CreateRestaurantRequest>,
    res: Response,
    next: NextFunction
  ) {
    const {
      name,
      avatar,
      description,
      address,
      phone_number,
      website,
      media,
      weekly_opening_hours,
      special_opening_days
    } = req.body
    const newRestaurant = await restaurantsServices.create({
      name,
      avatar,
      description,
      address,
      phone_number,
      website,
      media,
      weekly_opening_hours,
      special_opening_days
    })
    return res.status(HTTP_STATUS.CREATED).json({
      message: RESTAURANT_MESSAGES.CREATED_SUCCESS,
      data: newRestaurant
    })
  }

  async uploadRestaurantImage(req: Request, res: Response, next: NextFunction) {
    const params = {
      Bucket: process.env.AWS_BUCKET as string,
      ContentType: req.file?.mimetype,
      Key: `restaurants/${req.file?.filename}`,
      Body: req.file?.buffer
    }
    const result = await uploadFileToS3(params)
    return res.status(HTTP_STATUS.OK).json({
      data: result
    })
  }
  async deleteRestaurant(req: Request<GetRestaurantParams, any, any>, res: Response, next: NextFunction) {
    const { restaurant_id } = req.params
    const result = await restaurantsServices.deleteRestaurant(restaurant_id)
    if (!result) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: RESTAURANT_MESSAGES.NOT_FOUND
      })
    }
    return res.status(HTTP_STATUS.OK).json({
      message: RESTAURANT_MESSAGES.DELETED_SUCCESS
    })
  }
  async featuredRestaurants(req: Request, res: Response, next: NextFunction) {
    const restaurants = await restaurantsServices.getFeaturedRestaurants()
    return res.status(HTTP_STATUS.OK).json({
      data: restaurants
    })
  }
  async updateRestaurant(
    req: Request<GetRestaurantParams, any, Partial<CreateRestaurantRequest>>,
    res: Response,
    next: NextFunction
  ) {
    const { restaurant_id } = req.params
    const {
      name,
      avatar,
      description,
      address,
      phone_number,
      website,
      media,
      weekly_opening_hours,
      special_opening_days
    } = req.body
    const updatedRestaurant = await restaurantsServices.updateRestaurant(restaurant_id, {
      name,
      avatar,
      description,
      address,
      phone_number,
      website,
      media,
      weekly_opening_hours,
      special_opening_days
    })
    return res.status(HTTP_STATUS.OK).json({
      message: RESTAURANT_MESSAGES.UPDATED_SUCCESS,
      data: updatedRestaurant
    })
  }
}
export default new RestaurantControllers()
