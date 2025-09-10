import { Router } from 'express'
import ReviewsControllers from '~/controllers/reviews.controllers'
import UsersControllers from '~/controllers/users.controllers'
import { isAdmin, isAuthorized } from '~/middlewares/auth.middewares'
import catchAsync from '~/middlewares/catchAsync.middleware'
import { getReviewValidator } from '~/validations/review.validations'
import {
  signInValidator,
  signUpValidator,
  forgotPasswordValidator,
  forgotPasswordTokenValidator,
  resetPasswordValidator,
  updateProfileValidator,
  getOrUpdateUserValidator,
  refreshTokenValidator,
  changePasswordValidator,
  getListUserValidator
} from '~/validations/user.validations'
const router = Router()

router.route('/sign-up').post(signUpValidator, catchAsync(UsersControllers.signUp))
router.route('/sign-in').post(signInValidator, catchAsync(UsersControllers.signIn))
router.route('/forgot-password').post(forgotPasswordValidator, catchAsync(UsersControllers.forgotPassword))
router
  .route('/verify-forgot-password')
  .post(forgotPasswordTokenValidator, catchAsync(UsersControllers.verifyForgotPasswordToken))
router.route('/reset-password').post(resetPasswordValidator, catchAsync(UsersControllers.resetPassword))
router.post('/change-password', isAuthorized, changePasswordValidator, catchAsync(UsersControllers.changePassword))
router
  .route('/my-profile')
  .get(isAuthorized, catchAsync(UsersControllers.myProfile))
  .patch(isAuthorized, updateProfileValidator, catchAsync(UsersControllers.updateMyProfile))
router
  .route('/:user_id')
  .get(isAuthorized, getOrUpdateUserValidator, catchAsync(UsersControllers.getUserById))
  .patch(
    isAuthorized,
    isAdmin,
    getOrUpdateUserValidator,
    updateProfileValidator,
    catchAsync(UsersControllers.updateUser)
  )
  .delete(isAuthorized, isAdmin, catchAsync(UsersControllers.deleteUser))
router.route('/').get(isAuthorized, isAdmin, getListUserValidator, catchAsync(UsersControllers.getListUser))

router.post('/refresh-token', refreshTokenValidator, catchAsync(UsersControllers.refreshToken))
router.route('/:user_id/reviews').get(isAuthorized, getReviewValidator, catchAsync(ReviewsControllers.getUserReviews))
export default router
