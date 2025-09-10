import { ObjectId } from 'mongodb'
import databaseServices from './database.services'
import Role from '~/models/database/Role.schema'
import { RoleType } from '~/constants/enum'

class RoleServices {
  async getAll() {
    const roles = await databaseServices.roles.find().toArray()
    return roles
  }
  async getRole(role_name: string) {
    const role = await databaseServices.roles.findOne({ role_name })
    return role
  }

  async create({ role_name, role_id }: { role_name: string; role_id: RoleType }) {
    const result = await databaseServices.roles.insertOne(new Role({ role_name, role_id }))
    const role = await databaseServices.roles.findOne({ _id: result.insertedId })
    return role
  }

  async delete(role_id: string) {
    const result = await databaseServices.roles.deleteOne({ _id: new ObjectId(role_id) })
    return result.deletedCount === 1
  }
}

export default new RoleServices()
