import { getAdminProfile as getAdminProfileService, loginAdmin as loginAdminService } from '../services/adminService.js'
import { getErrorStatusCode } from '../utils/appError.js'

const loginAdmin = async (req, res) => {
    try {
        const result = await loginAdminService(req.body)

        return res.json({
            success: true,
            message: 'Admin login successful.',
            token: result.token,
            admin: result.admin,
        })
    } catch (error) {
        console.log(error)
        return res.status(getErrorStatusCode(error)).json({ success: false, message: error.message || 'Error logging in as admin.' })
    }
}

const getAdminProfile = async (req, res) => {
    try {
        const admin = await getAdminProfileService()

        return res.json({
            success: true,
            admin,
        })
    } catch (error) {
        console.log(error)
        return res.status(getErrorStatusCode(error)).json({ success: false, message: error.message || 'Error loading admin profile.' })
    }
}

export { getAdminProfile, loginAdmin }