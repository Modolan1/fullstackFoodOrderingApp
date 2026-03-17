import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { sanitizeEmail, sanitizePassword, sanitizeText, validateEmail, validateRequiredText } from '../../utils/inputSecurity'
import { StoreContext } from '../../Context/StoreContext'

const initialFormState = {
  name: '',
  email: '',
  password: '',
  acceptTerms: false,
}

const namePattern = /^[\p{L}][\p{L}\s'.-]*$/u

const LoginPopup = ({ setShowLogin }) => {
  const { authenticate } = useContext(StoreContext)
  const [currentState, setCurrentState] = useState('Login')
  const [formData, setFormData] = useState(initialFormState)
  const [fieldErrors, setFieldErrors] = useState({})
  const [status, setStatus] = useState({ type: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const setMode = (mode) => {
    setCurrentState(mode)
    setFieldErrors({})
    setStatus({ type: '', message: '' })
  }

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return currentState === 'Sign Up'
          ? validateRequiredText(value, {
            label: 'Name',
            min: 2,
            max: 80,
            pattern: namePattern,
            invalidMessage: 'Name contains invalid characters.',
          })
          : ''
      case 'email':
        return validateEmail(value, 'Email')
      case 'password':
        if (!value) {
          return 'Password is required.'
        }

        if (value.length < 8) {
          return 'Password must be at least 8 characters.'
        }

        return ''
      case 'acceptTerms':
        return value ? '' : 'You must accept the terms to continue.'
      default:
        return ''
    }
  }

  const validateForm = () => ({
    name: currentState === 'Sign Up' ? validateField('name', formData.name) : '',
    email: validateField('email', formData.email),
    password: validateField('password', formData.password),
    acceptTerms: validateField('acceptTerms', formData.acceptTerms),
  })

  const onChangeHandler = (event) => {
    const { name, value, type, checked } = event.target
    const nextValue = type === 'checkbox'
      ? checked
      : name === 'email'
        ? sanitizeEmail(value)
        : name === 'password'
          ? sanitizePassword(value)
          : sanitizeText(value, { maxLength: 80 })

    setFormData((current) => ({ ...current, [name]: nextValue }))
    setFieldErrors((current) => ({ ...current, [name]: validateField(name, nextValue) }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    const nextErrors = validateForm()
    setFieldErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      setStatus({ type: 'error', message: 'Fix the highlighted fields before continuing.' })
      return
    }

    setSubmitting(true)

    try {
      await authenticate(currentState, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      setStatus({
        type: 'success',
        message: currentState === 'Sign Up' ? 'Account created successfully.' : 'Login successful.',
      })
      setShowLogin(false)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Authentication failed.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='login-popup' onClick={() => setShowLogin(false)}>
      <form className='login-popup-container' onClick={(e) => e.stopPropagation()} onSubmit={onSubmitHandler}>
        <div className='login-popup-title'>
          <h2>{currentState}</h2>
          <button type='button' onClick={() => setShowLogin(false)} className='login-popup-close'>×</button>
        </div>

        <div className='login-popup-inputs'>
          {currentState === 'Sign Up' && (
            <>
              <input type='text' name='name' placeholder='Your name' value={formData.name} onChange={onChangeHandler} maxLength='80' aria-invalid={Boolean(fieldErrors.name)} required />
              {fieldErrors.name && <p className='field-error'>{fieldErrors.name}</p>}
            </>
          )}
          <input type='email' name='email' placeholder='Your email' value={formData.email} onChange={onChangeHandler} maxLength='254' aria-invalid={Boolean(fieldErrors.email)} required />
          {fieldErrors.email && <p className='field-error'>{fieldErrors.email}</p>}
          <input type='password' name='password' placeholder='Password' value={formData.password} onChange={onChangeHandler} maxLength='128' aria-invalid={Boolean(fieldErrors.password)} required />
          {fieldErrors.password && <p className='field-error'>{fieldErrors.password}</p>}
        </div>

        <button type='submit' disabled={submitting}>
          {submitting ? 'Please wait...' : currentState === 'Sign Up' ? 'Create account' : 'Login'}
        </button>

        <div className='login-popup-condition'>
          <input type='checkbox' name='acceptTerms' checked={formData.acceptTerms} onChange={onChangeHandler} aria-invalid={Boolean(fieldErrors.acceptTerms)} required />
          <p>By continuing, I agree to the terms of use and privacy policy.</p>
        </div>
        {fieldErrors.acceptTerms && <p className='field-error'>{fieldErrors.acceptTerms}</p>}
        {status.message && <p className={`login-popup-status ${status.type}`}>{status.message}</p>}

        {currentState === 'Login' ? (
          <p>
            Create a new account?{' '}
            <span onClick={() => setMode('Sign Up')}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <span onClick={() => setMode('Login')}>Login here</span>
          </p>
        )}
      </form>
    </div>
  )
}

export default LoginPopup
