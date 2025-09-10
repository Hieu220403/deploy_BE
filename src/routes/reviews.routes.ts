import { Router } from 'express'
import reviewsControllers from '~/controllers/reviews.controllers'
import { isAdmin, isAuthorized } from '~/middlewares/auth.middewares'
import catchAsync from '~/middlewares/catchAsync.middleware'
import { renameVideo, resizeImageReview, uploadReview } from '~/middlewares/uploadFile.middlewares'
import {
  createReviewValidator,
  deleteReviewValidator,
  getReviewValidator,
  updateReviewValidator
} from '~/validations/review.validations'

const router = Router()
router.route('/').get(isAuthorized, isAdmin, getReviewValidator, catchAsync(reviewsControllers.getReviews))

router.route('/recent').get(catchAsync(reviewsControllers.getReviewsRecent))

router
  .route('/:restaurant_id')
  .get(getReviewValidator, catchAsync(reviewsControllers.getReviewsByRestaurant))
  .post(isAuthorized, createReviewValidator, catchAsync(reviewsControllers.createReview))

router
  .route('/upload/:restaurant_id')
  .post(isAuthorized, uploadReview, resizeImageReview, renameVideo, catchAsync(reviewsControllers.uploadReviewFile))

router
  .route('/:review_id')
  .delete(isAuthorized, deleteReviewValidator, catchAsync(reviewsControllers.deleteReview))
  .patch(isAuthorized, isAdmin, updateReviewValidator, catchAsync(reviewsControllers.updateReview))

export default router
