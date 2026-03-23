import {
  handleStripeWebhook as handleStripeWebhookService,
  listOrders as listOrdersService,
  placeOrder as placeOrderService,
  updateOrderStatus as updateOrderStatusService,
  verifyOrderPayment as verifyOrderPaymentService,
} from '../services/orderService.js'
import { asyncHandler, getErrorStatusCode } from '../utils/appError.js'

const placeOrder = asyncHandler(async (req, res) => {
  const { items, address, paymentMethod } = req.body
  const result = await placeOrderService({
    userId: req.userId,
    items,
    address,
    paymentMethod,
  })

  if (paymentMethod === 'Card') {
    return res.status(201).json({
      success: true,
      message: 'Redirecting to Stripe checkout.',
      data: result.order,
      checkoutUrl: result.checkoutUrl,
    })
  }

  return res.status(201).json({
    success: true,
    message: 'Order placed successfully.',
    data: result.order,
  })
})

const verifyOrderPayment = asyncHandler(async (req, res) => {
  const { orderId, sessionId } = req.body
  const updatedOrder = await verifyOrderPaymentService({ orderId, sessionId })
  return res.json({ success: true, message: 'Payment verified successfully.', data: updatedOrder })
})

// Stripe webhook uses its own try/catch because Stripe requires a plain-text
// 400 response on signature verification failures, not a JSON envelope.
const handleStripeWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature']
    const result = await handleStripeWebhookService({
      signature,
      payload: req.body,
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error('[Webhook]', error.message)
    const status = getErrorStatusCode(error)

    if (status === 400) {
      return res.status(400).send(`Webhook error: ${error.message}`)
    }

    return res.status(status).json({ success: false, message: error.message })
  }
}

const listOrders = asyncHandler(async (req, res) => {
  const orders = await listOrdersService()
  res.json({ success: true, data: orders })
})

const updateStatus = asyncHandler(async (req, res) => {
  const { orderId, status } = req.body
  const updatedOrder = await updateOrderStatusService({ orderId, status })
  res.json({ success: true, message: 'Order status updated.', data: updatedOrder })
})

export { handleStripeWebhook, placeOrder, listOrders, updateStatus, verifyOrderPayment }