import fs from 'fs'
import {
  createFood,
  deleteFoodById,
  findAllFoods,
  findFoodById,
} from '../repositories/foodRepository.js'
import { AppError } from '../utils/appError.js'

const addFood = async ({ name, description, price, category, file }) => {
  if (!file?.filename) {
    throw new AppError('Food image is required.', 400)
  }

  await createFood({
    name,
    description,
    price,
    category,
    image: file.filename,
  })
}

const listFood = async () => findAllFoods()

const removeFood = async (id) => {
  const food = await findFoodById(id)

  if (!food) {
    throw new AppError('Food item not found.', 404)
  }

  if (food.image) {
    fs.unlink(`uploads/${food.image}`, () => {})
  }

  await deleteFoodById(id)
}

export { addFood, listFood, removeFood }
