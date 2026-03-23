import { addFood as addFoodService, listFood as listFoodService, removeFood as removeFoodService } from '../services/foodService.js'
import { asyncHandler } from '../utils/appError.js'

const addFood = asyncHandler(async (req, res) => {
    await addFoodService({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        file: req.file,
    })

    res.status(201).json({ success: true, message: 'Food added' })
})

const listFood = asyncHandler(async (req, res) => {
    const foods = await listFoodService()
    res.json({ success: true, data: foods })
})

const removeFood = asyncHandler(async (req, res) => {
    await removeFoodService(req.body.id)
    res.json({ success: true, message: 'food removed successfully' })
})

export { addFood, listFood, removeFood }