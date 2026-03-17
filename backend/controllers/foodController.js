import { addFood as addFoodService, listFood as listFoodService, removeFood as removeFoodService } from '../services/foodService.js'
import { getErrorStatusCode } from '../utils/appError.js'

const addFood = async (req, res) => {
    try {
        await addFoodService({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            file: req.file,
        })

        res.status(201).json({ success: true, message: 'Food added' })
    } catch (error) {
        console.log(error)
        res.status(getErrorStatusCode(error)).json({ success: false, message: 'Error adding food: ' + error.message })
    }
}

const listFood = async (req, res) => {
    try {
        const foods = await listFoodService()
        res.json({ success: true, data: foods })
    } catch (error) {
        console.log(error)
        res.status(getErrorStatusCode(error)).json({ success: false, message: 'error' })
    }
}

const removeFood = async (req, res) => {
    try {
        await removeFoodService(req.body.id)
        res.json({ success: true, message: 'food removed successfully' })
    } catch (error) {
        console.log(error)
        res.status(getErrorStatusCode(error)).json({ success: false, message: error.message || 'error' })
    }
}

export { addFood, listFood, removeFood }