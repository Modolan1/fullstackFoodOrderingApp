import orderModel from '../models/orderModel.js'

const createOrder = (payload) => orderModel.create(payload)

const findOrderById = (orderId) => orderModel.findById(orderId)

const updateOrderById = (orderId, update, options = { new: true }) => (
  orderModel.findByIdAndUpdate(orderId, update, options)
)

const findAllOrders = () => orderModel.find({}).sort({ createdAt: -1 })

export { createOrder, findAllOrders, findOrderById, updateOrderById }
