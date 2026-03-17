import express from "express"
import { getAdminProfile, loginAdmin } from "../controllers/adminController.js"
import adminAuth from "../middleware/adminAuth.js"

const adminRouter = express.Router()

adminRouter.post("/login", loginAdmin)
adminRouter.get("/me", adminAuth, getAdminProfile)

export default adminRouter