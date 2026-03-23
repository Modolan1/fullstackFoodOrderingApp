import React, { useContext, useEffect, useRef, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../utils/api'
import { sanitizeEmail, sanitizePhone, sanitizeText, validateEmail, validatePhone, validateRequiredText } from '../../utils/inputSecurity'

const initialAddress = {
  firstName: '',
  lastName: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  phone: '',
}

const namePattern = /^[\p{L}][\p{L}\s'.-]*$/u
const streetPattern = /^[\p{L}\d][\p{L}\d\s#.,'/-]*$/u
const cityPattern = /^[\p{L}][\p{L}\s'.-]*$/u
const zipCodePattern = /^[A-Za-z0-9][A-Za-z0-9 -]*$/
const paymentMethods = ['Cash On Delivery', 'Card']

const PlaceOrder = () => {
  const navigate = useNavigate()
  const { Food_List, cartItems, clearCart, token, currentUser } = useContext(StoreContext)
  const [address, setAddress] = useState(initialAddress)
  const [paymentMethod, setPaymentMethod] = useState('Cash On Delivery')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [orderSuccess, setOrderSuccess] = useState(false)
  const verificationInProgressRef = useRef(false)

  useEffect(() => {
    if (!orderSuccess) return
    const timer = setTimeout(() => navigate('/', { replace: true }), 3500)
    return () => clearTimeout(timer)
  }, [orderSuccess, navigate])

  const subtotal = Food_List.reduce((total, item) => {
    const quantity = cartItems[item._id] || 0
    return total + quantity * item.price
  }, 0)

  const deliveryFee = subtotal === 0 ? 0 : 2
  const total = subtotal + deliveryFee

  const orderItems = Food_List.filter((item) => (cartItems[item._id] || 0) > 0).map((item) => ({
    foodId: item._id,
    name: item.name,
    price: item.price,
    quantity: cartItems[item._id],
  }))

  const sanitizeAddressValue = (name, value) => {
    switch (name) {
      case 'email':
        return sanitizeEmail(value)
      case 'phone':
        return sanitizePhone(value)
      case 'street':
        return sanitizeText(value, { maxLength: 160, trim: false })
      case 'zipCode':
        return sanitizeText(value, { maxLength: 12, trim: false })
      default:
        return sanitizeText(value, { maxLength: 80, trim: false })
    }
  }

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        return validateRequiredText(value, {
          label: 'First name',
          min: 2,
          max: 80,
          pattern: namePattern,
          invalidMessage: 'First name contains invalid characters.',
        })
      case 'lastName':
        return validateRequiredText(value, {
          label: 'Last name',
          min: 2,
          max: 80,
          pattern: namePattern,
          invalidMessage: 'Last name contains invalid characters.',
        })
      case 'email':
        return validateEmail(value, 'Email address')
      case 'street':
        return validateRequiredText(value, {
          label: 'Street',
          min: 5,
          max: 160,
          pattern: streetPattern,
          invalidMessage: 'Street contains invalid characters.',
        })
      case 'city':
        return validateRequiredText(value, {
          label: 'City',
          min: 2,
          max: 80,
          pattern: cityPattern,
          invalidMessage: 'City contains invalid characters.',
        })
      case 'state':
        return validateRequiredText(value, {
          label: 'State',
          min: 2,
          max: 80,
          pattern: cityPattern,
          invalidMessage: 'State contains invalid characters.',
        })
      case 'zipCode':
        return validateRequiredText(value, {
          label: 'Zip code',
          min: 3,
          max: 12,
          pattern: zipCodePattern,
          invalidMessage: 'Zip code contains invalid characters.',
        })
      case 'country':
        return validateRequiredText(value, {
          label: 'Country',
          min: 2,
          max: 80,
          pattern: cityPattern,
          invalidMessage: 'Country contains invalid characters.',
        })
      case 'phone':
        return validatePhone(value, 'Phone number')
      default:
        return ''
    }
  }

  const validateForm = () => Object.fromEntries(
    Object.entries(address).map(([name, value]) => [name, validateField(name, value)]),
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    const orderId = params.get('orderId')
    const sessionId = params.get('session_id')

    if (!payment || verificationInProgressRef.current) {
      return
    }

    if (payment === 'cancel') {
      setStatus({ type: 'error', message: 'Card payment was canceled. You can try again or choose cash on delivery.' })
      return
    }

    if (payment !== 'success' || !orderId || !sessionId) {
      return
    }

    verificationInProgressRef.current = true

    const verifyPayment = async () => {
      try {
        const { response, result } = await apiFetch('/api/order/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId, sessionId }),
        })

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to verify payment.')
        }

        clearCart()
        setAddress(initialAddress)
        setOrderSuccess(true)
      } catch (error) {
        setStatus({ type: 'error', message: error.message || 'Payment verification failed.' })
      } finally {
        verificationInProgressRef.current = false
      }
    }

    verifyPayment()
  }, [clearCart, navigate])

  const onChangeHandler = (event) => {
    const { name, value } = event.target
    const sanitizedValue = sanitizeAddressValue(name, value)

    setAddress((current) => ({ ...current, [name]: sanitizedValue }))
    setFieldErrors((current) => ({ ...current, [name]: validateField(name, sanitizedValue) }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    if (!token || !currentUser) {
      setStatus({ type: 'error', message: 'Please sign in before placing an order.' })
      return
    }

    if (orderItems.length === 0) {
      setStatus({ type: 'error', message: 'Your cart is empty.' })
      return
    }

    const nextErrors = validateForm()
    setFieldErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      setStatus({ type: 'error', message: 'Fix the highlighted delivery details before placing the order.' })
      return
    }

    setSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const { response, result } = await apiFetch('/api/order/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          address,
          paymentMethod,
        }),
      })

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to place order.')
      }

      if (paymentMethod === 'Card') {
        if (!result.checkoutUrl) {
          throw new Error('Stripe checkout URL was not returned by the server.')
        }

        window.location.assign(result.checkoutUrl)
        return
      }

      clearCart()
      setAddress(initialAddress)
      setFieldErrors({})
      setPaymentMethod('Cash On Delivery')
      setOrderSuccess(true)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Request failed.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className='order-success-overlay'>
        <div className='order-success-card'>
          <div className='order-success-icon'>&#10003;</div>
          <h2>Order Placed Successfully!</h2>
          <p>Your order is being processed and will be delivered soon.</p>
          <p className='order-success-redirect'>Redirecting you to the home page&hellip;</p>
        </div>
      </div>
    )
  }

  return (
    <form className='place-order' onSubmit={onSubmitHandler}>
      <div className='place-order-left'>
        <p className='title'>Delivery Information</p>
        <div className='multi-fields'>
          <div className='place-order-field'>
            <input type='text' name='firstName' placeholder='First name' value={address.firstName} onChange={onChangeHandler} maxLength='80' aria-invalid={Boolean(fieldErrors.firstName)} required />
            {fieldErrors.firstName && <p className='field-error'>{fieldErrors.firstName}</p>}
          </div>
          <div className='place-order-field'>
            <input type='text' name='lastName' placeholder='Last name' value={address.lastName} onChange={onChangeHandler} maxLength='80' aria-invalid={Boolean(fieldErrors.lastName)} required />
            {fieldErrors.lastName && <p className='field-error'>{fieldErrors.lastName}</p>}
          </div>
        </div>
        <div className='place-order-field'>
          <input type='email' name='email' placeholder='Email address' value={address.email} onChange={onChangeHandler} maxLength='254' aria-invalid={Boolean(fieldErrors.email)} required />
          {fieldErrors.email && <p className='field-error'>{fieldErrors.email}</p>}
        </div>
        <div className='place-order-field'>
          <input type='text' name='street' placeholder='Street' value={address.street} onChange={onChangeHandler} maxLength='160' aria-invalid={Boolean(fieldErrors.street)} required />
          {fieldErrors.street && <p className='field-error'>{fieldErrors.street}</p>}
        </div>
        <div className='multi-fields'>
          <div className='place-order-field'>
            <input type='text' name='city' placeholder='City' value={address.city} onChange={onChangeHandler} maxLength='80' aria-invalid={Boolean(fieldErrors.city)} required />
            {fieldErrors.city && <p className='field-error'>{fieldErrors.city}</p>}
          </div>
          <div className='place-order-field'>
            <input type='text' name='state' placeholder='State' value={address.state} onChange={onChangeHandler} maxLength='80' aria-invalid={Boolean(fieldErrors.state)} required />
            {fieldErrors.state && <p className='field-error'>{fieldErrors.state}</p>}
          </div>
        </div>
        <div className='multi-fields'>
          <div className='place-order-field'>
            <input type='text' name='zipCode' placeholder='Zip code' value={address.zipCode} onChange={onChangeHandler} maxLength='12' aria-invalid={Boolean(fieldErrors.zipCode)} required />
            {fieldErrors.zipCode && <p className='field-error'>{fieldErrors.zipCode}</p>}
          </div>
          <div className='place-order-field'>
            <input type='text' name='country' placeholder='Country' value={address.country} onChange={onChangeHandler} maxLength='80' aria-invalid={Boolean(fieldErrors.country)} required />
            {fieldErrors.country && <p className='field-error'>{fieldErrors.country}</p>}
          </div>
        </div>
        <div className='place-order-field'>
          <input type='text' name='phone' placeholder='Phone' value={address.phone} onChange={onChangeHandler} maxLength='20' aria-invalid={Boolean(fieldErrors.phone)} required />
          {fieldErrors.phone && <p className='field-error'>{fieldErrors.phone}</p>}
        </div>
      </div>

      <div className='place-order-right'>
        <div className='cart-total'>
          <h2>Cart Totals</h2>
          {!currentUser && <p className='place-order-status error'>Sign in with a registered account to place an order.</p>}
          <div>
            <div className='cart-total-details'>
              <p>Subtotal</p>
              <p>${subtotal}</p>
            </div>
            <hr />
            <div className='cart-total-details'>
              <p>Delivery Fee</p>
              <p>${deliveryFee}</p>
            </div>
            <hr />
            <div className='cart-total-details'>
              <b>Total</b>
              <b>${total}</b>
            </div>
          </div>

          <div className='payment-methods'>
            <p className='payment-method-title'>Choose Payment Method</p>
            {paymentMethods.map((method) => (
              <label key={method} className='payment-method-option'>
                <input
                  type='radio'
                  name='paymentMethod'
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                <span>{method}</span>
              </label>
            ))}
            {paymentMethod === 'Card' && (
              <p className='payment-demo-note'>
                Stripe test card: 4242 4242 4242 4242, any future date, any CVC, any ZIP.
              </p>
            )}
          </div>

          {status.message && <p className={`place-order-status ${status.type}`}>{status.message}</p>}
          <button type='submit' disabled={subtotal === 0 || submitting}>
            {submitting ? 'PROCESSING...' : paymentMethod === 'Card' ? 'PAY WITH CARD' : 'PLACE ORDER'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder