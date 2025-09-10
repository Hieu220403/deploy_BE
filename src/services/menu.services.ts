import { ObjectId } from 'mongodb'
import Menu from '~/models/database/Menu.schema'
import { CreateMenuRequest } from '~/requests/menu.requests'
import { Media } from '~/type'
import { deleteImageFromS3 } from '~/utils/s3-bucket'
import databaseServices from './database.services'

class MenuServices {
  async getMenu(restaurant_id: string) {
    const menu = await databaseServices.menus.find({ restaurant: restaurant_id }).toArray()
    return menu
  }
  async createMenu(menuData: CreateMenuRequest & { restaurant_id: string }) {
    const result = await databaseServices.menus.insertOne(
      new Menu({
        restaurant_id: new ObjectId(menuData.restaurant_id),
        name: menuData.name,
        description: menuData.description,
        price: menuData.price,
        media: menuData.media || []
      })
    )
    const menu = await databaseServices.menus.findOne({ _id: result.insertedId })
    return menu
  }
  async updateMenu(menuData: CreateMenuRequest & { restaurant_id: string; menu_id: string }) {
    const result = await databaseServices.menus.updateOne(
      { restaurant: menuData.restaurant_id, _id: new ObjectId(menuData.menu_id) },
      {
        $set: {
          name: menuData.name,
          description: menuData.description,
          price: menuData.price,
          media: menuData.media || []
        }
      }
    )
    return result
  }
  async deleteMenu({ restaurant_id, menu_id }: { restaurant_id: string; menu_id: string }): Promise<boolean> {
    const menu = await databaseServices.restaurants.findOne({
      _id: new ObjectId(menu_id),
      restaurant_id: new ObjectId(restaurant_id)
    })
    if (menu && menu.media) {
      await Promise.all(menu.media.map((item: Media) => deleteImageFromS3(item.url)))
    }

    const result = await databaseServices.menus.deleteOne({
      restaurant: new ObjectId(restaurant_id),
      _id: new ObjectId(menu_id)
    })
    return result.deletedCount > 0
  }
}
export default new MenuServices()
