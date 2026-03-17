import "dotenv/config"
import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import { handleStripeWebhook } from "./controllers/orderController.js"
import adminRouter from "./routes/adminRoute.js"
import foodRouter from "./routes/foodRoute.js"
import orderRouter from "./routes/orderRoute.js"
import userRouter from "./routes/userRoute.js"

//app config
const app = express()
const port = 4000

app.post("/api/order/webhook", express.raw({ type: "application/json" }), handleStripeWebhook)

//middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

//api endpoints
app.use("/api/food", foodRouter)
app.use("/api/admin", adminRouter)
app.use("/api/user", userRouter)
app.use("/api/order", orderRouter)
app.use("/images", express.static('uploads'))

app.get("/", (req, res) => {
    res.send("API working")
})

// Global error handler
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ success: false, message: "Malformed JSON request body." })
    }

    console.error("Global error:", err.message)
    res.status(500).json({ success: false, message: "Server error: " + err.message })
})

const startServer = async () => {
    await connectDB()

    app.listen(port, () => {
        console.log(`server started on http://localhost:${port}`)
    })
}

startServer().catch((error) => {
    console.error("Failed to start server:", error.message)
    process.exit(1)
})