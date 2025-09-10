import { Router } from 'express'
import menusControllers from '~/controllers/menus.controllers'
import { isAdmin, isAuthorized } from '~/middlewares/auth.middewares'
import catchAsync from '~/middlewares/catchAsync.middleware'
import { resizeImageMenu, uploadMenu } from '~/middlewares/uploadFile.middlewares'
import {
  createMenuValidator,
  deleteMenuValidator,
  getMenuValidator,
  updateMenuValidator
} from '~/validations/menu.validations'

const router = Router()

router
  .route('/uploads')
  .post(isAuthorized, isAdmin, uploadMenu, resizeImageMenu, catchAsync(menusControllers.uploadMenuImage))
router
  .route('/:restaurant_id')
  .get(getMenuValidator, catchAsync(menusControllers.getMenu))
  .post(isAuthorized, isAdmin, createMenuValidator, catchAsync(menusControllers.createMenu))

router
  .route('/:menu_id/restaurants/:restaurant_id')
  .patch(isAuthorized, isAdmin, updateMenuValidator, catchAsync(menusControllers.updateMenu))
  .delete(isAuthorized, isAdmin, deleteMenuValidator, catchAsync(menusControllers.deleteMenu))
export default router
