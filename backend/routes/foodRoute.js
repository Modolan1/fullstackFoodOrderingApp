import express from "express"
import { addFood, listFood, removeFood, updateFood } from "../controllers/foodController.js"
import multer from "multer"
import { validateAddFood, validateImageUpload, validateRemoveFood, validateUpdateFood } from "../middleware/validation.js"
import adminAuth from "../middleware/adminAuth.js"

const foodRouter = express.Router();


//image storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads")
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

// Wrapper middleware to handle multer errors
const uploadMiddleware = (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.log("Multer error:", err.message)
            return res.status(400).json({ 
                success: false, 
                message: "File upload error: " + err.message 
            })
        } else if (err) {
            console.log("Unknown error:", err.message)
            return res.status(400).json({ 
                success: false, 
                message: "Error: " + err.message 
            })
        }
        next()
    })
}

foodRouter.post("/add", adminAuth, uploadMiddleware, validateImageUpload, validateAddFood, addFood)
foodRouter.get("/list",listFood)
foodRouter.post("/update", adminAuth, validateUpdateFood, updateFood)
foodRouter.post("/remove", adminAuth, validateRemoveFood, removeFood);



export default foodRouter;
