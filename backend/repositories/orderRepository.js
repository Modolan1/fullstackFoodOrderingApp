import orderModel from '../models/orderModel.js'

const createOrder = (payload) => orderModel.create(payload)

const findOrderById = (orderId) => orderModel.findById(orderId)

const updateOrderById = (orderId, update, options = { new: true }) => (
  orderModel.findByIdAndUpdate(orderId, update, options)
)

const findAllOrders = () => orderModel.find({}).sort({ createdAt: -1 })

const findRecentOrders = (filter = {}, limit = 5) => (
  orderModel.find(filter).sort({ createdAt: -1 }).limit(limit)
)

const aggregateOrders = (pipeline) => orderModel.aggregate(pipeline)

export { aggregateOrders, createOrder, findAllOrders, findOrderById, findRecentOrders, updateOrderById }
