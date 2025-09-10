import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserI } from '~/models/database/User.schema'
import { GetBookmarksRequest } from '~/requests/bookmark.requests'
import bookmarksServices from '~/services/bookmarks.services'

class BookmarkControllers {
  async getBookmarks(req: Request<ParamsDictionary, any, GetBookmarksRequest>, res: Response, next: NextFunction) {
    const { _id } = req.user as UserI
    const { page = 1, limit = 10 } = req.query
    const { bookmarks, total } = await bookmarksServices.getBookmarks({
      page: +page,
      limit: +limit,
      userId: _id!.toString()
    })
    return res.status(HTTP_STATUS.OK).json({
      data: bookmarks,
      pagination: {
        page: +page,
        limit: +limit,
        total
      }
    })
  }
  async createBookmark(req: Request, res: Response, next: NextFunction) {
    const { user_id, restaurant_id } = req.body
    const bookmark = await bookmarksServices.createBookmark({ user_id, restaurant_id })
    return res.status(HTTP_STATUS.CREATED).json({
      data: bookmark
    })
  }

  async deleteBookmark(req: Request, res: Response, next: NextFunction) {
    const { user_id, restaurant_id } = req.body
    const result = await bookmarksServices.deleteBookmark({ user_id, restaurant_id })
    return res.status(HTTP_STATUS.OK).json({
      data: result
    })
  }
}
export default new BookmarkControllers()
