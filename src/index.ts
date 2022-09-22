import express, { Application, Request, Response } from 'express'
import morgan from 'morgan'

import home from './routes/home'
import users from './routes/user'

const app: Application = express()
const port: number = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('tiny'))

app.use('/', home)

app.use('/api/user/', users)

app.listen(port, () => console.log(`Example app listening on port ${port}`))
