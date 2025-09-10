import { ObjectId } from 'mongodb'

interface BookmarkI {
  _id?: ObjectId
  user_id: ObjectId
  restaurant_id: ObjectId
  created_at?: Date
  updated_at?: Date
}
class Bookmark {
  _id?: ObjectId
  user_id: ObjectId
  restaurant_id: ObjectId
  created_at: Date
  updated_at: Date
  constructor(bookmark: BookmarkI) {
    this._id = bookmark._id || new ObjectId()
    this.user_id = bookmark.user_id
    this.restaurant_id = bookmark.restaurant_id
    this.created_at = bookmark.created_at || new Date()
    this.updated_at = bookmark.updated_at || new Date()
  }
}

export default Bookmark
