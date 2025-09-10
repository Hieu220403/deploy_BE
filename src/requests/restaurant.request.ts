import { SpecialOpeningDay, WeeklyOpeningHours } from '~/models/database/Restaurant.schema'
import { Media } from '~/type'

export interface GetRestaurantsRequest {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC'
  search?: string
  rating?: number
}

export interface GetRestaurantParams {
  restaurant_id: string
}

export interface CreateRestaurantRequest {
  name: string
  avatar: string
  description: string
  address: string
  phone_number: string
  weekly_opening_hours?: WeeklyOpeningHours[]
  special_opening_days?: SpecialOpeningDay[]
  website?: string | null
  media?: Media[]
}
