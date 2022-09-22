import express, { Router, Request, Response } from 'express'
const router: Router = express.Router()

import bcrypt from 'bcrypt'
import mongoose from 'mongoose'

const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect('mongodb://localhost:27017/user')
  } catch (error) {
    console.error(error)
  }
}

connectMongoDB()

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    created: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    collection: 'user',
    versionKey: false,
  }
)

interface Users {
  username: string
  password: string
  email: string
  phone: string
  age: number
}
const User = mongoose.model('user', userSchema)

router.get('/user', async (req: Request, res: Response) => {
  try {
    const users = await User.find({})
    res.status(200).json({
      resultCode: 20000,
      resultDescription: 'Success',
      resultData: {
        users: users,
      },
    })
  } catch (error: any) {
    res.status(500).json({
      resultCode: 50000,
      resultDescription: 'Error',
      resultData: error.message,
    })
  }
})

router.get('/user/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    res.status(200).json({
      resultCode: 20000,
      resultDescription: 'Success',
      resultData: {
        user: user,
      },
    })
  } catch (error: any) {
    res.status(500).json({
      resultCode: 50000,
      resultDescription: 'Error',
      resultData: error.message,
    })
  }
})

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, email, phone, age } = req.body

    const hash: string = await bcrypt.hash(password, 10)

    let user = new User()
    user.username = username
    user.email = email
    user.password = hash
    user.phone = phone
    user.age = age

    const result = await user.save()

    res.status(200).json({
      resultCode: 20000,
      resultDescription: 'Success',
      resultData: {
        users: result,
      },
    })
  } catch (error: any) {
    res.status(500).json({
      resultCode: 50000,
      resultDescription: 'Error',
      resultData: error.message,
    })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({
      email: email,
    })
    if (!user) {
      const error: any = new Error('not email')
      error.statusCode = 404
      throw error
    }

    const isValid: boolean = await bcrypt.compare(password, user.password)

    if (!isValid) {
      const error: any = new Error('password')
      error.statusCode = 404
      throw error
    }

    res.status(201).json({
      resultCode: 20100,
      resultDescription: 'Success',
      resultData: {
        users: user,
      },
    })
  } catch (error: any) {
    res.status(error.status || 500).json({
      resultCode: 50000,
      resultDescription: 'Error',
      resultData: error.message,
    })
  }
})

export default router
