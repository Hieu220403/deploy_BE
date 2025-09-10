import { ObjectId } from 'mongodb'
import { Media } from '~/type'

export interface ReviewI {
  _id?: ObjectId
  content: string
  restaurant_id: ObjectId
  user_id: ObjectId
  rating: number
  media: Media[]
  created_at?: Date
  updated_at?: Date
}
export default class Review {
  _id?: ObjectId
  content: string
  restaurant_id: ObjectId
  user_id: ObjectId
  rating: number
  media: Media[]
  created_at?: Date
  updated_at?: Date
  constructor(review: ReviewI) {
    const date = new Date()
    this._id = review._id
    this.content = review.content || ''
    this.restaurant_id = review.restaurant_id || new ObjectId()
    this.user_id = review.user_id || new ObjectId()
    this.rating = review.rating || 5
    this.media = review.media || []
    this.created_at = review.created_at || date
    this.updated_at = review.updated_at || date
  }
}
