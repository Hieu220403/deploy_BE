import { ObjectId } from 'mongodb'
import { DayOfWeek } from '~/constants/enum'
import { Media } from '~/type'

export interface WeeklyOpeningHours {
  day_of_week: DayOfWeek
  open: string
  close: string
}
export interface SpecialOpeningDay {
  date: Date
  open: string
  close: string
  note: string
}

export interface RestaurantI {
  _id?: ObjectId
  name: string
  avatar: string
  description: string
  address: string
  phone_number: string
  rating: number
  total_reviews: number
  weekly_opening_hours: WeeklyOpeningHours[]
  special_opening_days?: SpecialOpeningDay[]
  website?: string | null
  media?: Media[]
  created_at?: Date
  updated_at?: Date
}
export default class Restaurant {
  _id?: ObjectId
  name: string
  avatar: string
  description: string
  address: string
  phone_number: string
  rating: number
  total_reviews: number
  weekly_opening_hours: WeeklyOpeningHours[]
  special_opening_days?: SpecialOpeningDay[]
  media: Media[]
  website: string | null
  created_at: Date
  updated_at: Date
  constructor(restaurant: RestaurantI) {
    const date = new Date()
    this._id = restaurant._id
    this.name = restaurant.name || ''
    this.avatar = restaurant.avatar || ''
    this.description = restaurant.description || ''
    this.address = restaurant.address || ''
    this.phone_number = restaurant.phone_number || ''
    this.rating = restaurant.rating || 0
    this.total_reviews = restaurant.total_reviews || 0
    this.media = restaurant.media || []
    this.weekly_opening_hours = restaurant.weekly_opening_hours || []
    this.special_opening_days = restaurant.special_opening_days || []
    this.created_at = restaurant.created_at || date
    this.updated_at = restaurant.updated_at || date
    this.website = restaurant.website || null
  }
}
