import jwt from 'jsonwebtoken'
import { readAdminConfig } from '../repositories/adminRepository.js'
import { aggregateOrders, findRecentOrders } from '../repositories/orderRepository.js'
import { AppError } from '../utils/appError.js'

const createAdminToken = (adminEmail, jwtSecret) => jwt.sign(
  { role: 'admin', email: adminEmail },
  jwtSecret,
  { expiresIn: '12h' },
)

const loginAdmin = async (body) => {
  const config = readAdminConfig()

  if (!config.hasAdminAuthConfig) {
    throw new AppError('Admin auth is not configured on the server.', 500)
  }

  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '').trim()

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400)
  }

  if (email !== config.adminEmail || password !== config.adminPassword) {
    throw new AppError('Invalid admin credentials.', 401)
  }

  return {
    token: createAdminToken(config.adminEmail, config.jwtSecret),
    admin: {
      name: config.adminName,
      email: config.adminEmail,
    },
  }
}

const getAdminProfile = async () => {
  const config = readAdminConfig()

  if (!config.hasAdminAuthConfig) {
    throw new AppError('Admin auth is not configured on the server.', 500)
  }

  return {
    name: config.adminName,
    email: config.adminEmail,
  }
}

const reportPeriods = {
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
  all: { label: 'All time', days: 0 },
}

const parseReportDate = (value, edge) => {
  const normalizedValue = String(value || '').trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    throw new AppError('Custom report dates must use YYYY-MM-DD format.', 400)
  }

  return new Date(`${normalizedValue}T${edge === 'start' ? '00:00:00.000' : '23:59:59.999'}Z`)
}

const buildReportWindow = ({ period = '30d', startDate, endDate } = {}) => {
  const hasCustomRange = Boolean(startDate || endDate)

  if (hasCustomRange) {
    if (!startDate || !endDate) {
      throw new AppError('Both start and end dates are required for a custom report range.', 400)
    }

    const normalizedStartDate = parseReportDate(startDate, 'start')
    const normalizedEndDate = parseReportDate(endDate, 'end')

    if (Number.isNaN(normalizedStartDate.getTime()) || Number.isNaN(normalizedEndDate.getTime())) {
      throw new AppError('Custom report dates are invalid.', 400)
    }

    if (normalizedStartDate > normalizedEndDate) {
      throw new AppError('Custom report start date must be before the end date.', 400)
    }

    return {
      period: 'custom',
      label: 'Custom range',
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
    }
  }

  const normalizedPeriod = String(period || '30d').trim().toLowerCase()
  const config = reportPeriods[normalizedPeriod]

  if (!config) {
    throw new AppError('Invalid report period.', 400)
  }

  const windowEndDate = new Date()
  const windowStartDate = config.days
    ? new Date(windowEndDate.getTime() - config.days * 24 * 60 * 60 * 1000)
    : null

  return {
    period: normalizedPeriod,
    label: config.label,
    startDate: windowStartDate,
    endDate: windowEndDate,
  }
}

const getAdminReports = async ({ period, startDate, endDate }) => {
  const window = buildReportWindow({ period, startDate, endDate })
  const matchStage = window.startDate
    ? {
      createdAt: {
        $gte: window.startDate,
        $lte: window.endDate,
      },
    }
    : {}

  const [overviewResult, statusBreakdown, paymentBreakdown, dailyTrend, topItems, recentOrders] = await Promise.all([
    aggregateOrders([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
          paidRevenue: { $sum: { $cond: ['$payment', '$amount', 0] } },
          paidOrders: { $sum: { $cond: ['$payment', 1, 0] } },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] },
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Food Processing'] }, 1, 0] },
          },
          deliveryOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Out for Delivery'] }, 1, 0] },
          },
          averageOrderValue: { $avg: '$amount' },
        },
      },
    ]),
    aggregateOrders([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          orders: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { orders: -1, _id: 1 } },
    ]),
    aggregateOrders([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMethod',
          orders: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { revenue: -1, _id: 1 } },
    ]),
    aggregateOrders([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]),
    aggregateOrders([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            foodId: '$items.foodId',
            name: '$items.name',
          },
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { quantitySold: -1, revenue: -1 } },
      { $limit: 5 },
    ]),
    findRecentOrders(matchStage, 5),
  ])

  const overview = overviewResult[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    paidRevenue: 0,
    paidOrders: 0,
    deliveredOrders: 0,
    processingOrders: 0,
    deliveryOrders: 0,
    averageOrderValue: 0,
  }

  return {
    period: window.period,
    label: window.label,
    range: {
      startDate: window.startDate ? window.startDate.toISOString() : null,
      endDate: window.endDate.toISOString(),
    },
    overview,
    statusBreakdown: statusBreakdown.map((entry) => ({
      status: entry._id || 'Unknown',
      orders: entry.orders,
      revenue: entry.revenue,
    })),
    paymentBreakdown: paymentBreakdown.map((entry) => ({
      paymentMethod: entry._id || 'Unknown',
      orders: entry.orders,
      revenue: entry.revenue,
    })),
    dailyTrend: dailyTrend.map((entry) => ({
      date: `${entry._id.year}-${String(entry._id.month).padStart(2, '0')}-${String(entry._id.day).padStart(2, '0')}`,
      orders: entry.orders,
      revenue: entry.revenue,
    })),
    topItems: topItems.map((entry) => ({
      foodId: entry._id.foodId,
      name: entry._id.name,
      quantitySold: entry.quantitySold,
      revenue: entry.revenue,
    })),
    recentOrders: recentOrders.map((order) => ({
      _id: order._id,
      customerName: `${order.address.firstName} ${order.address.lastName}`,
      amount: order.amount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      payment: order.payment,
      createdAt: order.createdAt,
      itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
    })),
  }
}

export { getAdminProfile, getAdminReports, loginAdmin }
