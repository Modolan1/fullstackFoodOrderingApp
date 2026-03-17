const resolveEnvValue = (value) => String(value || '').trim()

const readAdminConfig = () => {
  const jwtSecret = resolveEnvValue(process.env.JWT_SECRET)
  const configuredAdminEmail = resolveEnvValue(process.env.ADMIN_EMAIL).toLowerCase()
  const configuredAdminPassword = resolveEnvValue(process.env.ADMIN_PASSWORD)
  const configuredAdminName = resolveEnvValue(process.env.ADMIN_NAME)

  const adminEmail = configuredAdminEmail && configuredAdminEmail !== 'replace_admin_email'
    ? configuredAdminEmail
    : ''

  const adminPassword = configuredAdminPassword && configuredAdminPassword !== 'replace_admin_password'
    ? configuredAdminPassword
    : ''

  const adminName = configuredAdminName || 'Administrator'

  return {
    jwtSecret,
    adminEmail,
    adminPassword,
    adminName,
    hasAdminAuthConfig: Boolean(jwtSecret && adminEmail && adminPassword),
  }
}

export { readAdminConfig }
