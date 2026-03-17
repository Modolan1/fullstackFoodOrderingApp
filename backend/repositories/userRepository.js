import userModel from '../models/userModel.js'

const findUserByEmail = (email) => userModel.findOne({ email })

const createUser = (payload) => userModel.create(payload)

const findUserById = (userId) => userModel.findById(userId).select('_id name email')

export { createUser, findUserByEmail, findUserById }
