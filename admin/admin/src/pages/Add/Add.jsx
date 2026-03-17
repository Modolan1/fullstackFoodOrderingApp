import React, { useContext, useState } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import { apiFetchWithAuth } from '../../utils/api'
import { sanitizeDecimalInput, sanitizeText, validateImageFile, validatePrice, validateRequiredText } from '../../utils/inputSecurity'
import { AdminContext } from '../../Context/AdminContext'

const initialFormState = {
  name: '',
  description: '',
  price: '',
  category: 'Salad',
}

const categories = ['Salad', 'Rolls', 'Desserts', 'Sandwich', 'Cake', 'Pure Veg', 'Pasta', 'Noodles']
const foodNamePattern = /^[\p{L}\d\s&().,'/-]+$/u

const Add = () => {
  const { token } = useContext(AdminContext)
  const [image, setImage] = useState(null)
  const [formData, setFormData] = useState(initialFormState)
  const [fieldErrors, setFieldErrors] = useState({})
  const [status, setStatus] = useState({ type: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

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

  const validateForm = () => {
    const nextErrors = {
      name: validateField('name', formData.name),
      description: validateField('description', formData.description),
      category: validateField('category', formData.category),
      price: validateField('price', formData.price),
      image: validateImageFile(image),
    }

    return nextErrors
  }

  const onChangeHandler = (event) => {
    const { name, value } = event.target
    const sanitizedValue = name === 'price'
      ? sanitizeDecimalInput(value)
      : sanitizeText(value, {
        maxLength: name === 'description' ? 1000 : 120,
        multiline: name === 'description',
        trim: false,
      })

    setFormData((current) => ({ ...current, [name]: sanitizedValue }))
    setFieldErrors((current) => ({ ...current, [name]: validateField(name, sanitizedValue) }))
  }

  const onImageChange = (event) => {
    const nextImage = event.target.files?.[0] || null
    const imageError = validateImageFile(nextImage)

    setImage(imageError ? null : nextImage)
    setFieldErrors((current) => ({ ...current, image: imageError }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    const nextErrors = validateForm()
    setFieldErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      setStatus({ type: 'error', message: 'Fix the highlighted fields before submitting.' })
      return
    }

    setSubmitting(true)
    setStatus({ type: '', message: '' })

    const payload = new FormData()
    payload.append('image', image)
    payload.append('name', sanitizeText(formData.name, { maxLength: 120, trim: true }))
    payload.append('description', sanitizeText(formData.description, { maxLength: 1000, multiline: true, trim: true }))
    payload.append('price', formData.price)
    payload.append('category', formData.category)

    try {
      const { response, result } = await apiFetchWithAuth('/api/food/add', token, {
        method: 'POST',
        body: payload,
      })

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to add food item.')
      }

      setFormData(initialFormState)
      setImage(null)
      setFieldErrors({})
      setStatus({ type: 'success', message: result.message || 'Food item added successfully.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Request failed.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className='add-page'>
      <div className='page-heading'>
        <h1>Add Menu Item</h1>
        <p>Create a new food item and save it to the database.</p>
      </div>

      <form className='add-form' onSubmit={onSubmitHandler}>
        <label className='add-form-group image-picker'>
          <span>Upload image</span>
          <div className='image-picker-box'>
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt='Upload preview'
              className='image-preview'
            />
          </div>
          <input
            type='file'
            accept='image/*'
            hidden
            onChange={onImageChange}
          />
          {fieldErrors.image && <p className='field-error'>{fieldErrors.image}</p>}
        </label>

        <label className='add-form-group'>
          <span>Product name</span>
          <input
            type='text'
            name='name'
            placeholder='Type here'
            value={formData.name}
            onChange={onChangeHandler}
            maxLength='120'
            aria-invalid={Boolean(fieldErrors.name)}
            required
          />
          {fieldErrors.name && <p className='field-error'>{fieldErrors.name}</p>}
        </label>

        <label className='add-form-group'>
          <span>Product description</span>
          <textarea
            name='description'
            rows='6'
            placeholder='Write content here'
            value={formData.description}
            onChange={onChangeHandler}
            maxLength='1000'
            aria-invalid={Boolean(fieldErrors.description)}
            required
          />
          {fieldErrors.description && <p className='field-error'>{fieldErrors.description}</p>}
        </label>

        <div className='add-form-row'>
          <label className='add-form-group'>
            <span>Product category</span>
            <select name='category' value={formData.category} onChange={onChangeHandler} aria-invalid={Boolean(fieldErrors.category)}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {fieldErrors.category && <p className='field-error'>{fieldErrors.category}</p>}
          </label>

          <label className='add-form-group price-field'>
            <span>Product price</span>
            <input
              type='number'
              name='price'
              min='0'
              step='0.01'
              placeholder='20'
              value={formData.price}
              onChange={onChangeHandler}
              inputMode='decimal'
              maxLength='12'
              aria-invalid={Boolean(fieldErrors.price)}
              required
            />
            {fieldErrors.price && <p className='field-error'>{fieldErrors.price}</p>}
          </label>
        </div>

        {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}

        <button className='add-button' type='submit' disabled={submitting}>
          {submitting ? 'Saving...' : 'Add Item'}
        </button>
      </form>
    </section>
  )
}

export default Add