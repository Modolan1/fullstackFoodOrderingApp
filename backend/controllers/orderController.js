import {
  handleStripeWebhook as handleStripeWebhookService,
  listOrders as listOrdersService,
  placeOrder as placeOrderService,
  updateOrderStatus as updateOrderStatusService,
  verifyOrderPayment as verifyOrderPaymentService,
} from '../services/orderService.js'
import { getErrorStatusCode } from '../utils/appError.js'

const placeOrder = async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error)
    return res.status(getErrorStatusCode(error)).json({ success: false, message: 'Error placing order: ' + error.message })
  }
}

const verifyOrderPayment = async (req, res) => {
  try {
    const { orderId, sessionId } = req.body
    const updatedOrder = await verifyOrderPaymentService({ orderId, sessionId })
    return res.json({ success: true, message: 'Payment verified successfully.', data: updatedOrder })
  } catch (error) {
    console.log(error)
    return res.status(getErrorStatusCode(error)).json({ success: false, message: 'Error verifying payment: ' + error.message })
  }
}

const handleStripeWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature']
    const result = await handleStripeWebhookService({
      signature,
      payload: req.body,
    })

    return res.status(200).json(result)
  } catch (error) {
    console.log(error)
    const status = getErrorStatusCode(error)

    if (status === 400) {
      return res.status(400).send(`Webhook error: ${error.message}`)
    }

    return res.status(status).json({ success: false, message: error.message })
  }
}

const listOrders = async (req, res) => {
  try {
    const orders = await listOrdersService()
    res.json({ success: true, data: orders })
  } catch (error) {
    console.log(error)
    res.status(getErrorStatusCode(error)).json({ success: false, message: 'Error fetching orders.' })
  }
}

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body
    const updatedOrder = await updateOrderStatusService({ orderId, status })
    res.json({ success: true, message: 'Order status updated.', data: updatedOrder })
  } catch (error) {
    console.log(error)
    res.status(getErrorStatusCode(error)).json({ success: false, message: 'Error updating order status.' })
  }
}

export { handleStripeWebhook, placeOrder, listOrders, updateStatus, verifyOrderPayment }