import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import route from '~/routes'
import databaseServices from '~/services/database.services'
import errorMiddleware from '~/middlewares/error.middlewares'
dotenv.config()
const app = express()
app.use(
  cors({
    origin: '*'
  })
)
const port = process.env.PORT || 5000
app.use(express.json())

route(app)
databaseServices.connect()
app.use(errorMiddleware)

app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`)
})
