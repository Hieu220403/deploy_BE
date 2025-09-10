import { Router } from 'express'
import { isAdmin, isAuthorized } from '~/middlewares/auth.middewares'

import menusControllers from '~/controllers/menus.controllers'
import restaurantsControllers from '~/controllers/restaurants.controllers'
import catchAsync from '~/middlewares/catchAsync.middleware'
import { renameVideo, resizeImageRestaurant, uploadRestaurant } from '~/middlewares/uploadFile.middlewares'
import { deleteMenuValidator, updateMenuValidator } from '~/validations/menu.validations'
import {
  createRestaurantValidator,
  getListValidator,
  getOrDeleteRestaurantDetailValidator,
  updateRestaurantValidator
} from '~/validations/restaurant.validations'
const router = Router()
router
  .route('/')
  .get(getListValidator, catchAsync(restaurantsControllers.getRestaurants))
  .post(isAuthorized, createRestaurantValidator, catchAsync(restaurantsControllers.createRestaurant))
router.route('/featured').get(catchAsync(restaurantsControllers.featuredRestaurants))
router
  .route('/uploads')
  .post(
    isAuthorized,
    uploadRestaurant,
    resizeImageRestaurant,
    renameVideo,
    catchAsync(restaurantsControllers.uploadRestaurantImage)
  )
router
  .route('/:restaurant_id')
  .delete(
    isAuthorized,
    getOrDeleteRestaurantDetailValidator,
    isAdmin,
    catchAsync(restaurantsControllers.deleteRestaurant)
  )
  .get(getOrDeleteRestaurantDetailValidator, catchAsync(restaurantsControllers.getRestaurantDetail))
  .patch(isAuthorized, isAdmin, updateRestaurantValidator, catchAsync(restaurantsControllers.updateRestaurant))
router
  .route('/:restaurant_id/menus/:menu_id')
  .delete(isAuthorized, isAdmin, deleteMenuValidator, catchAsync(menusControllers.deleteMenu))
  .patch(isAuthorized, isAdmin, updateMenuValidator, catchAsync(menusControllers.updateMenu))

export default router
