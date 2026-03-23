import {
    getAdminProfile as getAdminProfileService,
    getAdminReports as getAdminReportsService,
    loginAdmin as loginAdminService,
} from '../services/adminService.js'
import { asyncHandler } from '../utils/appError.js'

const loginAdmin = asyncHandler(async (req, res) => {
    const result = await loginAdminService(req.body)

    return res.json({
        success: true,
        message: 'Admin login successful.',
        token: result.token,
        admin: result.admin,
    })
})

const getAdminProfile = asyncHandler(async (req, res) => {
    const admin = await getAdminProfileService()

    return res.json({
        success: true,
        admin,
    })
})

const getAdminReports = asyncHandler(async (req, res) => {
    const reports = await getAdminReportsService({
        period: req.query.period,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
    })

    return res.json({
        success: true,
        reports,
    })
})

export { getAdminProfile, getAdminReports, loginAdmin }