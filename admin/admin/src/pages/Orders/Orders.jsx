import React, { useContext, useEffect, useState } from 'react'
import './Orders.css'
import { assets } from '../../assets/assets'
import { apiFetchWithAuth } from '../../utils/api'
import { AdminContext } from '../../Context/AdminContext'

const orderStatuses = ['Food Processing', 'Out for Delivery', 'Delivered']

const Orders = () => {
  const { token } = useContext(AdminContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState('')

  const fetchOrders = async () => {
    setLoading(true)

    try {
      const { response, result } = await apiFetchWithAuth('/api/order/list', token)

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to load orders.')
      }

      setOrders(result.data || [])
      setStatusMessage('')
    } catch (error) {
      setStatusMessage(error.message || 'Request failed.')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId)

    try {
      const { response, result } = await apiFetchWithAuth('/api/order/status', token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status }),
      })

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to update order status.')
      }

      setOrders((current) => current.map((order) => (order._id === orderId ? { ...order, status } : order)))
      setStatusMessage('')
    } catch (error) {
      setStatusMessage(error.message || 'Update failed.')
    } finally {
      setUpdatingOrderId('')
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <section className='orders-page'>
      <div className='page-heading'>
        <h1>Orders</h1>
        <p>Track incoming orders and update delivery progress.</p>
      </div>

      {loading ? (
        <div className='orders-placeholder'>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className='orders-placeholder'>No orders yet.</div>
      ) : (
        <div className='orders-list'>
          {orders.map((order) => (
            <article className='order-card' key={order._id}>
              <img src={assets.parcel_icon} alt='Order parcel' className='order-card-icon' />

              <div className='order-card-body'>
                <p className='order-items'>
                  {order.items.map((item) => `${item.name} x ${item.quantity}`).join(', ')}
                </p>
                <p className='order-customer'>
                  {order.address.firstName} {order.address.lastName}
                </p>
                <p className='order-address'>
                  {order.address.street}, {order.address.city}, {order.address.state}, {order.address.country},{' '}
                  {order.address.zipCode}
                </p>
                <p className='order-phone'>{order.address.phone}</p>
              </div>

              <div className='order-card-meta'>
                <p>
                  <span>Items</span>
                  <strong>{order.items.length}</strong>
                </p>
                <p>
                  <span>Total</span>
                  <strong>${Number(order.amount).toFixed(2)}</strong>
                </p>
                <p>
                  <span>Status</span>
                  <strong>{order.status}</strong>
                </p>
              </div>

              <select
                className='order-status-select'
                value={order.status}
                disabled={updatingOrderId === order._id}
                onChange={(event) => updateOrderStatus(order._id, event.target.value)}
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </article>
          ))}
        </div>
      )}

      {statusMessage && <p className='orders-error'>{statusMessage}</p>}
    </section>
  )
}

export default Orders