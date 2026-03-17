import foodModel from '../models/foodModels.js'

const createFood = (payload) => foodModel.create(payload)

const findAllFoods = () => foodModel.find({})

const findFoodById = (id) => foodModel.findById(id)

const deleteFoodById = (id) => foodModel.findByIdAndDelete(id)

export { createFood, deleteFoodById, findAllFoods, findFoodById }
