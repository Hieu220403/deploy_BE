import { Router } from 'express'
import bookmarksControllers from '~/controllers/bookmarks.controllers'
import { isAuthorized } from '~/middlewares/auth.middewares'
import catchAsync from '~/middlewares/catchAsync.middleware'
import { addBookmarkValidator, getBookmarksValidator } from '~/validations/bookmark.validations'

const router = Router()

router
  .route('/')
  .get(isAuthorized, getBookmarksValidator, catchAsync(bookmarksControllers.getBookmarks))
  .post(isAuthorized, addBookmarkValidator, catchAsync(bookmarksControllers.createBookmark))
  .delete(isAuthorized, addBookmarkValidator, catchAsync(bookmarksControllers.deleteBookmark))

export default router
