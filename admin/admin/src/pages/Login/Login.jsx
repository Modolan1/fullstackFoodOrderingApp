import React, { useContext, useState } from 'react'
import './Login.css'
import { AdminContext } from '../../Context/AdminContext'

const Login = () => {
  const { login } = useContext(AdminContext)
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const onChangeHandler = (event) => {
    const { name, value } = event.target
    setCredentials((current) => ({ ...current, [name]: value.trimStart() }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    if (!credentials.email.trim() || !credentials.password) {
      setStatus({ type: 'error', message: 'Enter your admin email and password.' })
      return
    }

    setSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      await login({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      })

      setStatus({ type: 'success', message: 'Welcome back.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Login failed.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className='admin-login-page'>
      <form className='admin-login-card' onSubmit={onSubmitHandler}>
        <h1>Admin Login</h1>
        <p>Sign in to manage foods and orders.</p>

        <label>
          <span>Email</span>
          <input
            type='email'
            name='email'
            value={credentials.email}
            onChange={onChangeHandler}
            placeholder='admin@fooddelivery.com'
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type='password'
            name='password'
            value={credentials.password}
            onChange={onChangeHandler}
            placeholder='Enter password'
            required
          />
        </label>

        {status.message && <p className={`admin-login-status ${status.type}`}>{status.message}</p>}

        <button type='submit' disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}

export default Login