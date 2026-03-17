import {
  getCurrentUser as getCurrentUserService,
  loginUser as loginUserService,
  registerUser as registerUserService,
} from '../services/userService.js'
import { getErrorStatusCode } from '../utils/appError.js'

const registerUser = async (req, res) => {
  try {
    const result = await registerUserService(req.body)

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token: result.token,
      user: result.user,
    })
  } catch (error) {
    console.log(error)
    return res.status(getErrorStatusCode(error)).json({ success: false, message: error.message || 'Error creating account.' })
  }
}

const loginUser = async (req, res) => {
  try {
    const result = await loginUserService(req.body)

    return res.json({
      success: true,
      message: 'Login successful.',
      token: result.token,
      user: result.user,
    })
  } catch (error) {
    console.log(error)
    return res.status(getErrorStatusCode(error)).json({ success: false, message: error.message || 'Error logging in.' })
  }
}

const getCurrentUser = async (req, res) => {
  try {
    const user = await getCurrentUserService(req.userId)

    return res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.log(error)
    return res.status(getErrorStatusCode(error)).json({ success: false, message: error.message || 'Error loading user profile.' })
  }
}

export { getCurrentUser, loginUser, registerUser }