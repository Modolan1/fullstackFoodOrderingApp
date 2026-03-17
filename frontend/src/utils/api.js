const fallbackApiUrl = 'http://localhost:4000'

export const API_URL = (import.meta.env.VITE_API_URL || fallbackApiUrl).trim().replace(/\/$/, '')

const parseJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  const bodyText = await response.text()

  if (!contentType.includes('application/json')) {
    if (bodyText.startsWith('<!DOCTYPE') || bodyText.startsWith('<html')) {
      throw new Error(`API returned HTML instead of JSON. Check that the backend is running on ${API_URL}.`)
    }

    throw new Error(bodyText || 'Unexpected non-JSON response from server.')
  }

  try {
    return JSON.parse(bodyText)
  } catch {
    throw new Error('Invalid JSON response from server.')
  }
}

export const apiFetch = async (path, options) => {
  const response = await fetch(`${API_URL}${path}`, options)
  const result = await parseJsonResponse(response)

  return { response, result }
}