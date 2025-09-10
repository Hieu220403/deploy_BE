import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import Bookmark from '~/models/database/Bookmark.schema'
import { GetBookmarksRequest } from '~/requests/bookmark.requests'

class BookmarkServices {
  async getBookmarks({
    page,
    limit,
    userId
  }: Required<GetBookmarksRequest> & { userId: string }): Promise<{ bookmarks: Bookmark[]; total: number }> {
    const reqBookmark = databaseServices.bookmarks
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId)
          }
        },
        {
          $lookup: {
            from: 'restaurants',
            localField: 'restaurantId',
            foreignField: '_id',
            as: 'restaurants'
          }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        },
        {
          $sort: { created_at: -1 }
        }
      ])
      .toArray()

    const reqTotalBookmark = databaseServices.bookmarks.countDocuments({
      userId: new ObjectId(userId)
    })

    const [bookmarks, total] = await Promise.all([reqBookmark, reqTotalBookmark])
    return {
      bookmarks: (bookmarks as Bookmark[]) || [],
      total: total || 0
    }
  }
  async createBookmark({ user_id, restaurant_id }: { user_id: string; restaurant_id: string }): Promise<Bookmark> {
    const result = await databaseServices.bookmarks.insertOne(
      new Bookmark({
        user_id: new ObjectId(user_id),
        restaurant_id: new ObjectId(restaurant_id)
      })
    )
    const bookmark = await databaseServices.bookmarks.findOne({
      _id: result.insertedId
    })
    return bookmark as Bookmark
  }

  async deleteBookmark({ user_id, restaurant_id }: { user_id: string; restaurant_id: string }): Promise<boolean> {
    const result = await databaseServices.bookmarks.deleteOne(
      new Bookmark({
        user_id: new ObjectId(user_id),
        restaurant_id: new ObjectId(restaurant_id)
      })
    )
    if (result.deletedCount === 0) {
      return false
    }
    return true
  }
}
export default new BookmarkServices()
