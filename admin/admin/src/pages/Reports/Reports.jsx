import React, { useContext, useEffect, useState } from 'react'
import './Reports.css'
import { apiFetchWithAuth } from '../../utils/api'
import { AdminContext } from '../../Context/AdminContext'

const periodOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom range' },
]

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('en-US')

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0))
const formatNumber = (value) => numberFormatter.format(Number(value || 0))
const formatDate = (value) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const escapeCsvValue = (value) => {
  const normalizedValue = String(value ?? '')

  if (/[",\n]/.test(normalizedValue)) {
    return `"${normalizedValue.replace(/"/g, '""')}"`
  }

  return normalizedValue
}

const downloadCsv = (fileName, columns, rows) => {
  const header = columns.join(',')
  const body = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n')
  const csvContent = `${header}\n${body}`
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const buildChartPoints = (values, width, height, padding) => {
  if (values.length === 0) {
    return ''
  }

  const maxValue = Math.max(...values, 1)
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  return values.map((value, index) => {
    const x = values.length === 1
      ? width / 2
      : padding + (index / (values.length - 1)) * innerWidth
    const y = padding + innerHeight - (value / maxValue) * innerHeight
    return `${x},${y}`
  }).join(' ')
}

const TrendChart = ({ title, subtitle, data, dataKey, color, valueFormatter }) => {
  const width = 640
  const height = 220
  const padding = 24
  const values = data.map((entry) => Number(entry[dataKey] || 0))
  const points = buildChartPoints(values, width, height, padding)
  const maxValue = Math.max(...values, 1)
  const lastValue = values[values.length - 1] || 0
  const firstValue = values[0] || 0
  const delta = lastValue - firstValue
  const areaPoints = points
    ? `${padding},${height - padding} ${points} ${width - padding},${height - padding}`
    : ''

  return (
    <article className='report-panel chart-panel'>
      <div className='report-panel-header'>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className='chart-metric'>
          <strong>{valueFormatter(lastValue)}</strong>
          <span className={delta >= 0 ? 'positive' : 'negative'}>
            {delta >= 0 ? '+' : ''}{valueFormatter(delta)} from first point
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className='report-table-empty'>No trend data in this window.</div>
      ) : (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} className='trend-chart' role='img' aria-label={title}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={color} stopOpacity='0.28' />
                <stop offset='100%' stopColor={color} stopOpacity='0.02' />
              </linearGradient>
            </defs>
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className='trend-axis' />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} className='trend-axis' />
            <text x={padding} y={padding - 6} className='trend-label'>{valueFormatter(maxValue)}</text>
            <text x={padding} y={height - 8} className='trend-label'>0</text>
            <polygon points={areaPoints} fill={`url(#gradient-${dataKey})`} />
            <polyline points={points} fill='none' stroke={color} strokeWidth='4' strokeLinejoin='round' strokeLinecap='round' />
            {points.split(' ').map((point) => {
              const [x, y] = point.split(',')
              return <circle key={point} cx={x} cy={y} r='5' fill={color} />
            })}
          </svg>
          <div className='trend-footer'>
            <span>{formatDate(data[0].date)}</span>
            <span>{formatDate(data[data.length - 1].date)}</span>
          </div>
        </>
      )}
    </article>
  )
}

const Reports = () => {
  const { token } = useContext(AdminContext)
  const [period, setPeriod] = useState('30d')
  const [appliedFilters, setAppliedFilters] = useState({ period: '30d', startDate: '', endDate: '' })
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadReports = async () => {
      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams()

        if (appliedFilters.period === 'custom') {
          params.set('startDate', appliedFilters.startDate)
          params.set('endDate', appliedFilters.endDate)
        } else {
          params.set('period', appliedFilters.period)
        }

        const { response, result } = await apiFetchWithAuth(`/api/admin/reports?${params.toString()}`, token)

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to load reports.')
        }

        if (!cancelled) {
          setReport(result.reports)
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError.message || 'Request failed.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadReports()

    return () => {
      cancelled = true
    }
  }, [appliedFilters, token])

  const overview = report?.overview || {}
  const canApplyCustomRange = Boolean(customRange.startDate && customRange.endDate)

  const onPeriodChange = (event) => {
    const nextPeriod = event.target.value
    setPeriod(nextPeriod)

    if (nextPeriod !== 'custom') {
      setAppliedFilters({ period: nextPeriod, startDate: '', endDate: '' })
      setError('')
    }
  }

  const onCustomRangeChange = (event) => {
    const { name, value } = event.target
    setCustomRange((current) => ({ ...current, [name]: value }))
  }

  const applyCustomRange = () => {
    if (!customRange.startDate || !customRange.endDate) {
      setError('Choose both a start and end date for a custom report.')
      return
    }

    if (customRange.startDate > customRange.endDate) {
      setError('Custom report start date must be before the end date.')
      return
    }

    setAppliedFilters({ period: 'custom', ...customRange })
    setError('')
  }

  const exportStatusBreakdown = () => {
    downloadCsv(
      'status-breakdown.csv',
      ['Status', 'Orders', 'Revenue'],
      (report?.statusBreakdown || []).map((entry) => [entry.status, entry.orders, entry.revenue]),
    )
  }

  const exportPaymentBreakdown = () => {
    downloadCsv(
      'payment-mix.csv',
      ['Payment Method', 'Orders', 'Revenue'],
      (report?.paymentBreakdown || []).map((entry) => [entry.paymentMethod, entry.orders, entry.revenue]),
    )
  }

  const exportDailyTrend = () => {
    downloadCsv(
      'daily-trend.csv',
      ['Date', 'Orders', 'Revenue'],
      (report?.dailyTrend || []).map((entry) => [entry.date, entry.orders, entry.revenue]),
    )
  }

  const exportTopItems = () => {
    downloadCsv(
      'top-items.csv',
      ['Item', 'Quantity Sold', 'Revenue'],
      (report?.topItems || []).map((entry) => [entry.name, entry.quantitySold, entry.revenue]),
    )
  }

  const exportRecentOrders = () => {
    downloadCsv(
      'recent-orders.csv',
      ['Customer', 'Status', 'Total', 'Payment Method', 'Paid', 'Created At', 'Item Count'],
      (report?.recentOrders || []).map((entry) => [
        entry.customerName,
        entry.status,
        entry.amount,
        entry.paymentMethod,
        entry.payment ? 'Yes' : 'No',
        entry.createdAt,
        entry.itemCount,
      ]),
    )
  }

  return (
    <section className='reports-page'>
      <div className='reports-header'>
        <div>
          <h1>Reports</h1>
          <p>Generate operational summaries from live order data.</p>
        </div>

        <label className='reports-filter'>
          <span>Reporting window</span>
          <select value={period} onChange={onPeriodChange}>
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {period === 'custom' && (
        <div className='reports-custom-range'>
          <label className='reports-filter'>
            <span>Start date</span>
            <input type='date' name='startDate' value={customRange.startDate} onChange={onCustomRangeChange} />
          </label>
          <label className='reports-filter'>
            <span>End date</span>
            <input type='date' name='endDate' value={customRange.endDate} onChange={onCustomRangeChange} />
          </label>
          <button type='button' className='reports-apply-button' onClick={applyCustomRange} disabled={!canApplyCustomRange}>
            Apply custom range
          </button>
        </div>
      )}

      {loading ? (
        <div className='reports-placeholder'>Generating report...</div>
      ) : error ? (
        <div className='reports-error'>{error}</div>
      ) : (
        <>
          <div className='reports-summary'>
            <article className='summary-card'>
              <span>Total Orders</span>
              <strong>{formatNumber(overview.totalOrders)}</strong>
            </article>
            <article className='summary-card'>
              <span>Total Revenue</span>
              <strong>{formatCurrency(overview.totalRevenue)}</strong>
            </article>
            <article className='summary-card'>
              <span>Paid Revenue</span>
              <strong>{formatCurrency(overview.paidRevenue)}</strong>
            </article>
            <article className='summary-card'>
              <span>Average Order</span>
              <strong>{formatCurrency(overview.averageOrderValue)}</strong>
            </article>
          </div>

          <div className='reports-grid charts-grid'>
            <TrendChart
              title='Daily Revenue Trend'
              subtitle='Revenue movement across the selected window'
              data={report.dailyTrend || []}
              dataKey='revenue'
              color='#ea580c'
              valueFormatter={formatCurrency}
            />
            <TrendChart
              title='Daily Orders Trend'
              subtitle='Order volume across the selected window'
              data={report.dailyTrend || []}
              dataKey='orders'
              color='#0f766e'
              valueFormatter={formatNumber}
            />
          </div>

          <div className='reports-grid'>
            <article className='report-panel'>
              <div className='report-panel-header'>
                <div>
                  <h2>Status Breakdown</h2>
                  <p>{report.label}</p>
                </div>
                <button type='button' className='report-export-button' onClick={exportStatusBreakdown}>
                  Export CSV
                </button>
              </div>
              <div className='report-stats-list'>
                {(report.statusBreakdown || []).map((entry) => (
                  <div className='report-stat-row' key={entry.status}>
                    <span>{entry.status}</span>
                    <strong>{formatNumber(entry.orders)} orders</strong>
                    <em>{formatCurrency(entry.revenue)}</em>
                  </div>
                ))}
              </div>
            </article>

            <article className='report-panel'>
              <div className='report-panel-header'>
                <div>
                  <h2>Payment Mix</h2>
                  <p>How customers paid</p>
                </div>
                <button type='button' className='report-export-button' onClick={exportPaymentBreakdown}>
                  Export CSV
                </button>
              </div>
              <div className='report-stats-list'>
                {(report.paymentBreakdown || []).map((entry) => (
                  <div className='report-stat-row' key={entry.paymentMethod}>
                    <span>{entry.paymentMethod}</span>
                    <strong>{formatNumber(entry.orders)} orders</strong>
                    <em>{formatCurrency(entry.revenue)}</em>
                  </div>
                ))}
              </div>
            </article>

            <article className='report-panel wide'>
              <div className='report-panel-header'>
                <div>
                  <h2>Daily Trend</h2>
                  <p>Orders and revenue by day</p>
                </div>
                <button type='button' className='report-export-button' onClick={exportDailyTrend}>
                  Export CSV
                </button>
              </div>
              <div className='report-table'>
                <div className='report-table-head'>
                  <span>Date</span>
                  <span>Orders</span>
                  <span>Revenue</span>
                </div>
                {(report.dailyTrend || []).length === 0 ? (
                  <div className='report-table-empty'>No order activity in this window.</div>
                ) : (
                  report.dailyTrend.map((entry) => (
                    <div className='report-table-row' key={entry.date}>
                      <span>{formatDate(entry.date)}</span>
                      <span>{formatNumber(entry.orders)}</span>
                      <span>{formatCurrency(entry.revenue)}</span>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className='report-panel'>
              <div className='report-panel-header'>
                <div>
                  <h2>Top Items</h2>
                  <p>Best-selling menu items</p>
                </div>
                <button type='button' className='report-export-button' onClick={exportTopItems}>
                  Export CSV
                </button>
              </div>
              <div className='report-table compact'>
                <div className='report-table-head'>
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Revenue</span>
                </div>
                {(report.topItems || []).length === 0 ? (
                  <div className='report-table-empty'>No item sales yet.</div>
                ) : (
                  report.topItems.map((entry) => (
                    <div className='report-table-row' key={`${entry.foodId}-${entry.name}`}>
                      <span>{entry.name}</span>
                      <span>{formatNumber(entry.quantitySold)}</span>
                      <span>{formatCurrency(entry.revenue)}</span>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className='report-panel'>
              <div className='report-panel-header'>
                <div>
                  <h2>Recent Orders</h2>
                  <p>Latest orders in this window</p>
                </div>
                <button type='button' className='report-export-button' onClick={exportRecentOrders}>
                  Export CSV
                </button>
              </div>
              <div className='report-table compact'>
                <div className='report-table-head'>
                  <span>Customer</span>
                  <span>Status</span>
                  <span>Total</span>
                </div>
                {(report.recentOrders || []).length === 0 ? (
                  <div className='report-table-empty'>No recent orders yet.</div>
                ) : (
                  report.recentOrders.map((entry) => (
                    <div className='report-table-row' key={entry._id}>
                      <span>
                        {entry.customerName}
                        <small>{formatDate(entry.createdAt)}</small>
                      </span>
                      <span>{entry.status}</span>
                      <span>{formatCurrency(entry.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>
        </>
      )}
    </section>
  )
}

export default Reports