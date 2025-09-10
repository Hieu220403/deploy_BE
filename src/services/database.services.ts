import dotenv from 'dotenv'
import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import Bookmark from '~/models/database/Bookmark.schema'
import Menu from '~/models/database/Menu.schema'
import Restaurant from '~/models/database/Restaurant.schema'
import Review from '~/models/database/Review.schema'
import Role from '~/models/database/Role.schema'
import User from '~/models/database/User.schema'
dotenv.config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.gq6vrxw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true
      }
    })
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.client.connect()
      await this.client.db('admin').command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
    } finally {
    }
  }
  get users(): Collection<User> {
    return this.db.collection('users')
  }
  get restaurants(): Collection<Restaurant> {
    return this.db.collection('restaurants')
  }
  get reviews(): Collection<Review> {
    return this.db.collection('reviews')
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection('bookmarks')
  }
  get roles(): Collection<Role> {
    return this.db.collection('roles')
  }
  get menus(): Collection<Menu> {
    return this.db.collection('menus')
  }
}
export default new DatabaseService()
