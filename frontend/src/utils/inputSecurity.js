const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const ZERO_WIDTH_PATTERN = /[\u200B-\u200D\uFEFF]/g
const UNSAFE_MARKUP_PATTERN = /<\s*\/?\s*[a-z!][^>]*>|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|on[a-z]+\s*=|&#(?:x[a-f0-9]+|\d+);?/i
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024

const normalizeValue = (value) => String(value ?? '')
  .normalize('NFKC')
  .replace(CONTROL_CHAR_PATTERN, '')
  .replace(ZERO_WIDTH_PATTERN, '')

export const containsUnsafeMarkup = (value) => UNSAFE_MARKUP_PATTERN.test(normalizeValue(value))

export const sanitizeText = (value, { maxLength = 120, multiline = false } = {}) => {
  let sanitized = normalizeValue(value).replace(/[<>]/g, '')

  if (multiline) {
    sanitized = sanitized
      .replace(/\r\n?/g, '\n')
      .replace(/[^\S\n]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  } else {
    sanitized = sanitized.replace(/\s+/g, ' ').trim()
  }

  return sanitized.slice(0, maxLength)
}

export const sanitizeEmail = (value) => normalizeValue(value)
  .replace(/\s+/g, '')
  .toLowerCase()
  .slice(0, 254)

export const sanitizePhone = (value) => normalizeValue(value)
  .replace(/[^\d+()\-\s]/g, '')
  .replace(/\s{2,}/g, ' ')
  .trim()
  .slice(0, 20)

export const sanitizePromoCode = (value) => normalizeValue(value)
  .toUpperCase()
  .replace(/[^A-Z0-9-]/g, '')
  .slice(0, 20)

export const sanitizePassword = (value) => normalizeValue(value).slice(0, 128)

export const sanitizeDecimalInput = (value) => {
  const sanitized = normalizeValue(value)
    .replace(/[^\d.]/g, '')
    .replace(/(\..*)\./g, '$1')

  return sanitized.slice(0, 12)
}

export const validateRequiredText = (
  value,
  {
    label,
    min = 1,
    max = 120,
    multiline = false,
    pattern,
    invalidMessage = `${label} contains invalid characters.`,
  },
) => {
  const sanitized = sanitizeText(value, { maxLength: max, multiline })

  if (!sanitized) {
    return `${label} is required.`
  }

  if (containsUnsafeMarkup(value)) {
    return `${label} contains blocked HTML or script content.`
  }

  if (sanitized.length < min) {
    return `${label} must be at least ${min} characters.`
  }

  if (pattern && !pattern.test(sanitized)) {
    return invalidMessage
  }

  return ''
}

export const validateEmail = (value, label = 'Email') => {
  const sanitized = sanitizeEmail(value)

  if (!sanitized) {
    return `${label} is required.`
  }

  if (containsUnsafeMarkup(value) || !EMAIL_PATTERN.test(sanitized)) {
    return `${label} is invalid.`
  }

  return ''
}

export const validatePhone = (value, label = 'Phone number') => {
  const sanitized = sanitizePhone(value)
  const digitsOnly = sanitized.replace(/\D/g, '')

  if (!sanitized) {
    return `${label} is required.`
  }

  if (containsUnsafeMarkup(value) || digitsOnly.length < 7 || digitsOnly.length > 15) {
    return `${label} is invalid.`
  }

  return ''
}

export const validatePrice = (value, label = 'Price') => {
  const numericValue = Number(value)

  if (value === '') {
    return `${label} is required.`
  }

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return `${label} must be a valid non-negative number.`
  }

  return ''
}

export const validatePromoCode = (value) => {
  const sanitized = sanitizePromoCode(value)

  if (!sanitized) {
    return 'Promo code is required.'
  }

  if (!/^[A-Z0-9-]{4,20}$/.test(sanitized)) {
    return 'Promo code must be 4 to 20 characters using letters, numbers, or dashes.'
  }

  return ''
}

export const validateImageFile = (file) => {
  if (!file) {
    return 'Select an image before submitting.'
  }

  if (!IMAGE_TYPES.includes(file.type)) {
    return 'Image must be a JPG, PNG, WEBP, or GIF file.'
  }

  if (file.size > IMAGE_SIZE_LIMIT) {
    return 'Image must be 5MB or smaller.'
  }

  return ''
}