import { Media } from '~/type'

export interface GetMenuParamsRequest {
  restaurant_id: string
}

export interface CreateMenuRequest {
  name: string
  description: string
  price: number
  media?: Media[]
}

export interface UpdateOrDeleteMenuRequest extends GetMenuParamsRequest {
  menu_id: string
}
