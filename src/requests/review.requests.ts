import { Media } from '~/type'

export interface GetReviewsRequest {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC'
  rating?: number
}

export interface CreateReviewRequest {
  content: string
  restaurant_id: string
  user_id: string
  rating: number
  media?: Media[]
}
