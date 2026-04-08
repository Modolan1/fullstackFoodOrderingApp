import React, { useContext, useEffect, useRef, useState } from 'react'
import './List.css'
import { API_URL, apiFetch, apiFetchWithAuth } from '../../utils/api'
import { AdminContext } from '../../Context/AdminContext'
import { sanitizeDecimalInput, sanitizeText, validatePrice, validateRequiredText } from '../../utils/inputSecurity'

const categories = ['rice', 'soup', 'dessert', 'swallow', 'snacks', 'drinks', 'pepper-soup']
const foodNamePattern = /^[\p{L}\d\s&().,'/-]+$/u

const initialEditForm = {
  id: '',
  name: '',
  description: '',
  category: 'soup',
  price: '',
}

const List = () => {
  const { token } = useContext(AdminContext)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [editForm, setEditForm] = useState(initialEditForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const updateSectionRef = useRef(null)

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

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateRequiredText(value, {
          label: 'Product name',
          min: 2,
          max: 120,
          pattern: foodNamePattern,
          invalidMessage: 'Product name contains invalid characters.',
        })
      case 'description':
        return validateRequiredText(value, {
          label: 'Product description',
          min: 10,
          max: 1000,
          multiline: true,
        })
      case 'category':
        return categories.includes(value) ? '' : 'Select a valid product category.'
      case 'price':
        return validatePrice(value, 'Product price')
      default:
        return ''
    }
  }

  const validateEditForm = () => {
    const nextErrors = {
      name: validateField('name', editForm.name),
      description: validateField('description', editForm.description),
      category: validateField('category', editForm.category),
      price: validateField('price', editForm.price),
    }

    setFieldErrors(nextErrors)
    return Object.values(nextErrors).every((error) => !error)
  }

  const startEditing = (item) => {
    setEditForm({
      id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      price: String(item.price ?? ''),
    })
    setFieldErrors({})
    setStatus('')
  }

  useEffect(() => {
    if (!editForm.id || !updateSectionRef.current) {
      return
    }

    updateSectionRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [editForm.id])

  const cancelEditing = () => {
    setEditForm(initialEditForm)
    setFieldErrors({})
  }

  const onEditInputChange = (event) => {
    const { name, value } = event.target
    const sanitizedValue = name === 'price'
      ? sanitizeDecimalInput(value)
      : sanitizeText(value, {
        maxLength: name === 'description' ? 1000 : 120,
        multiline: name === 'description',
        trim: false,
      })

    setEditForm((current) => ({ ...current, [name]: sanitizedValue }))
    setFieldErrors((current) => ({ ...current, [name]: validateField(name, sanitizedValue) }))
  }

  const saveEdit = async (event) => {
    event.preventDefault()

    if (!validateEditForm()) {
      setStatus('Fix the highlighted fields before saving.')
      return
    }

    setSaving(true)

    try {
      const payload = {
        id: editForm.id,
        name: sanitizeText(editForm.name, { maxLength: 120, trim: true }),
        description: sanitizeText(editForm.description, { maxLength: 1000, multiline: true, trim: true }),
        category: editForm.category,
        price: editForm.price,
      }

      const { response, result } = await apiFetchWithAuth('/api/food/update', token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to update item.')
      }

      const updatedItem = result.data
      setItems((current) => current.map((item) => (item._id === updatedItem._id ? updatedItem : item)))
      setStatus(result.message || 'Item updated successfully.')
      cancelEditing()
    } catch (error) {
      setStatus(error.message || 'Update failed.')
    } finally {
      setSaving(false)
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
              <div className='row-actions'>
                <button className='edit-button' type='button' onClick={() => startEditing(item)}>
                  Edit
                </button>
                <button className='delete-button' type='button' onClick={() => removeItem(item._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}

        {editForm.id && (
          <form className='edit-form' onSubmit={saveEdit} ref={updateSectionRef}>
            <h2>Edit Item</h2>

            <label>
              Name
              <input
                type='text'
                name='name'
                value={editForm.name}
                onChange={onEditInputChange}
                maxLength='120'
                aria-invalid={Boolean(fieldErrors.name)}
                required
              />
              {fieldErrors.name && <span className='field-error'>{fieldErrors.name}</span>}
            </label>

            <label>
              Description
              <textarea
                name='description'
                rows='4'
                value={editForm.description}
                onChange={onEditInputChange}
                maxLength='1000'
                aria-invalid={Boolean(fieldErrors.description)}
                required
              />
              {fieldErrors.description && <span className='field-error'>{fieldErrors.description}</span>}
            </label>

            <div className='edit-form-row'>
              <label>
                Category
                <select
                  name='category'
                  value={editForm.category}
                  onChange={onEditInputChange}
                  aria-invalid={Boolean(fieldErrors.category)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && <span className='field-error'>{fieldErrors.category}</span>}
              </label>

              <label>
                Price
                <input
                  type='number'
                  name='price'
                  min='0'
                  step='0.01'
                  value={editForm.price}
                  onChange={onEditInputChange}
                  inputMode='decimal'
                  maxLength='12'
                  aria-invalid={Boolean(fieldErrors.price)}
                  required
                />
                {fieldErrors.price && <span className='field-error'>{fieldErrors.price}</span>}
              </label>
            </div>

            <div className='edit-form-actions'>
              <button type='button' className='cancel-button' onClick={cancelEditing} disabled={saving}>
                Cancel
              </button>
              <button type='submit' className='save-button' disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {status && <p className='list-error'>{status}</p>}
      </div>
    </section>
  )
}

export default List