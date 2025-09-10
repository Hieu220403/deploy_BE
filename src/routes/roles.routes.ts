import { Router } from 'express'
import rolesControllers from '~/controllers/roles.controllers'

import { isAdmin, isAuthorized } from '~/middlewares/auth.middewares'
import catchAsync from '~/middlewares/catchAsync.middleware'
import { createRoleValidator, deleteRoleValidator } from '~/validations/role.validations'

const router = Router()

router
  .route('/')
  .get(isAuthorized, isAdmin, catchAsync(rolesControllers.getAll))
  .post(isAuthorized, isAdmin, createRoleValidator, catchAsync(rolesControllers.create))
router.route('/:role_id').delete(isAuthorized, isAdmin, deleteRoleValidator, catchAsync(rolesControllers.delete))

export default router
