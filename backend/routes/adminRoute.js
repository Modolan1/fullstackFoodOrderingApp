import express from "express"
import { getAdminProfile, getAdminReports, loginAdmin } from "../controllers/adminController.js"
import adminAuth from "../middleware/adminAuth.js"

const adminRouter = express.Router()

adminRouter.post("/login", loginAdmin)
adminRouter.get("/me", adminAuth, getAdminProfile)
adminRouter.get("/reports", adminAuth, getAdminReports)

export default adminRouter