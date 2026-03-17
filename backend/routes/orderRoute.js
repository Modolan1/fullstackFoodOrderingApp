import express from "express"
import { listOrders, placeOrder, updateStatus, verifyOrderPayment } from "../controllers/orderController.js"
import authMiddleware from "../middleware/auth.js"
import adminAuth from "../middleware/adminAuth.js"
import { validatePlaceOrder, validateUpdateOrderStatus, validateVerifyOrderPayment } from "../middleware/validation.js"

const orderRouter = express.Router()

orderRouter.post("/place", authMiddleware, validatePlaceOrder, placeOrder)
orderRouter.post("/verify", validateVerifyOrderPayment, verifyOrderPayment)
orderRouter.get("/list", adminAuth, listOrders)
orderRouter.post("/status", adminAuth, validateUpdateOrderStatus, updateStatus)

export default orderRouter