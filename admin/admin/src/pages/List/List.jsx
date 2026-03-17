import React, { useContext, useEffect, useState } from 'react'
import './List.css'
import { API_URL, apiFetch, apiFetchWithAuth } from '../../utils/api'
import { AdminContext } from '../../Context/AdminContext'

const List = () => {
  const { token } = useContext(AdminContext)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  const fetchItems = async () => {
    setLoading(true)

    try {
      const { response, result } = await apiFetch('/api/food/list')

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to load food items.')
      }

      setItems(result.data || [])
      setStatus('')
    } catch (error) {
      setStatus(error.message || 'Request failed.')
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (id) => {
    try {
      const { response, result } = await apiFetchWithAuth('/api/food/remove', token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to remove item.')
      }

      setItems((current) => current.filter((item) => item._id !== id))
      setStatus('')
    } catch (error) {
      setStatus(error.message || 'Delete failed.')
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return (
    <section className='list-page'>
      <div className='page-heading'>
        <h1>Food List</h1>
        <p>View menu items already stored in the database.</p>
      </div>

      <div className='list-card'>
        <div className='list-header'>
          <span>Image</span>
          <span>Name</span>
          <span>Category</span>
          <span>Price</span>
          <span>Action</span>
        </div>

        {loading ? (
          <p className='list-message'>Loading items...</p>
        ) : items.length === 0 ? (
          <p className='list-message'>No food items found.</p>
        ) : (
          items.map((item) => (
            <div className='list-row' key={item._id}>
              <img src={`${API_URL}/images/${item.image}`} alt={item.name} className='list-image' />
              <span>{item.name}</span>
              <span>{item.category}</span>
              <span>${Number(item.price).toFixed(2)}</span>
              <button className='delete-button' type='button' onClick={() => removeItem(item._id)}>
                Remove
              </button>
            </div>
          ))
        )}

        {status && <p className='list-error'>{status}</p>}
      </div>
    </section>
  )
}

export default List