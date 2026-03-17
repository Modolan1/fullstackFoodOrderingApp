import Stripe from 'stripe'
import {
  createOrder,
  findAllOrders,
  updateOrderById,
} from '../repositories/orderRepository.js'
import { AppError } from '../utils/appError.js'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')

const getStripeClient = () => {
  if (!stripeSecretKey) {
    throw new AppError('Stripe is not configured. Set STRIPE_SECRET_KEY in backend environment.', 500)
  }

  return new Stripe(stripeSecretKey)
}

const markOrderAsPaid = async (orderId, stripeSessionId, paymentIntentId) => {
  const update = {
    payment: true,
    paymentMethod: 'Card',
  }

  if (stripeSessionId) {
    update.stripeSessionId = stripeSessionId
  }

  if (paymentIntentId) {
    update.stripePaymentIntentId = paymentIntentId
  }

  return updateOrderById(orderId, update, { new: true })
}

const placeOrder = async ({ userId, items, address, paymentMethod }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal === 0 ? 0 : 2
  const amount = subtotal + deliveryFee

  const newOrder = await createOrder({
    userId,
    items,
    amount,
    address,
    paymentMethod,
  })

  if (paymentMethod === 'Card') {
    const stripe = getStripeClient()
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Delivery Fee',
          },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: address.email,
      success_url: `${frontendUrl}/place-order?payment=success&orderId=${newOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/place-order?payment=cancel&orderId=${newOrder._id}`,
      metadata: {
        orderId: newOrder._id.toString(),
      },
    })

    await updateOrderById(newOrder._id, { stripeSessionId: session.id }, { new: true })

    return {
      order: newOrder,
      checkoutUrl: session.url,
    }
  }

  return {
    order: newOrder,
    checkoutUrl: '',
  }
}

const verifyOrderPayment = async ({ orderId, sessionId }) => {
  const stripe = getStripeClient()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (!session || session.metadata?.orderId !== orderId) {
    throw new AppError('Payment verification failed.', 400)
  }

  if (session.payment_status !== 'paid') {
    throw new AppError('Payment not completed.', 400)
  }

  const updatedOrder = await markOrderAsPaid(
    orderId,
    session.id,
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
  )

  if (!updatedOrder) {
    throw new AppError('Order not found.', 404)
  }

  return updatedOrder
}

const handleStripeWebhook = async ({ signature, payload }) => {
  if (!stripeWebhookSecret) {
    throw new AppError('Stripe webhook secret is not configured.', 500)
  }

  if (!signature) {
    throw new AppError('Missing Stripe signature.', 400)
  }

  const stripe = getStripeClient()
  const event = stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret)

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object
    const orderId = session.metadata?.orderId

    if (orderId) {
      await markOrderAsPaid(
        orderId,
        session.id,
        typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
      )
    }
  }

  return { received: true }
}

const listOrders = async () => findAllOrders()

const updateOrderStatus = async ({ orderId, status }) => {
  const updatedOrder = await updateOrderById(orderId, { status }, { new: true })

  if (!updatedOrder) {
    throw new AppError('Order not found.', 404)
  }

  return updatedOrder
}

export { handleStripeWebhook, listOrders, placeOrder, updateOrderStatus, verifyOrderPayment }
