import jwt from 'jsonwebtoken'
import { readAdminConfig } from '../repositories/adminRepository.js'
import { AppError } from '../utils/appError.js'

const createAdminToken = (adminEmail, jwtSecret) => jwt.sign(
  { role: 'admin', email: adminEmail },
  jwtSecret,
  { expiresIn: '12h' },
)

const loginAdmin = async (body) => {
  const config = readAdminConfig()

  if (!config.hasAdminAuthConfig) {
    throw new AppError('Admin auth is not configured on the server.', 500)
  }

  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '').trim()

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400)
  }

  if (email !== config.adminEmail || password !== config.adminPassword) {
    throw new AppError('Invalid admin credentials.', 401)
  }

  return {
    token: createAdminToken(config.adminEmail, config.jwtSecret),
    admin: {
      name: config.adminName,
      email: config.adminEmail,
    },
  }
}

const getAdminProfile = async () => {
  const config = readAdminConfig()

  if (!config.hasAdminAuthConfig) {
    throw new AppError('Admin auth is not configured on the server.', 500)
  }

  return {
    name: config.adminName,
    email: config.adminEmail,
  }
}

export { getAdminProfile, loginAdmin }
