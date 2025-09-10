import { ObjectId } from 'mongodb'
import { Media } from '~/type'

export interface MenuI {
  _id?: ObjectId
  restaurant_id: ObjectId
  name: string
  description: string
  price: number
  media?: Media[]
  created_at?: Date
  updated_at?: Date
}

class Menu {
  _id?: ObjectId
  restaurant_id: ObjectId
  name: string
  description: string
  price: number
  media?: Media[]
  created_at?: Date
  updated_at?: Date
  constructor(menu: MenuI) {
    this._id = menu._id
    this.restaurant_id = menu.restaurant_id
    this.name = menu.name
    this.description = menu.description
    this.price = menu.price
    this.media = menu.media || []
    this.created_at = menu.created_at
    this.updated_at = menu.updated_at
  }
}

export default Menu
