import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import AWS from 'https://esm.sh/aws-sdk@2.1691.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ReportRequest {
  type: 'dashboard' | 'sales' | 'campaigns' | 'customers'
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  start_date?: string
  end_date?: string
  restaurant_id: string
  export_format?: 'json' | 'csv' | 'pdf'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json() as ReportRequest
    const { type, period, start_date, end_date, restaurant_id, export_format = 'json' } = requestData

    // Calculate date range
    const dateRange = calculateDateRange(period, start_date, end_date)

    let reportData

    switch (type) {
      case 'dashboard': {
        reportData = await generateDashboardReport(restaurant_id, dateRange)
        break
      }
      case 'sales': {
        reportData = await generateSalesReport(restaurant_id, dateRange)
        break
      }
      case 'campaigns': {
        reportData = await generateCampaignsReport(restaurant_id, dateRange)
        break
      }
      case 'customers': {
        reportData = await generateCustomersReport(restaurant_id, dateRange)
        break
      }
      default: {
        throw new Error(`Unsupported report type: ${type}`)
      }
    }

    if (export_format === 'json') {
      return new Response(
        JSON.stringify({ success: true, data: reportData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For CSV or PDF exports, generate file and return download URL
    const exportedFile = await exportReport(reportData, export_format, type)
    
    return new Response(
      JSON.stringify({ success: true, download_url: exportedFile.url, file_name: exportedFile.name }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating report:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function calculateDateRange(period: string, start_date?: string, end_date?: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case 'today':
      return {
        start: today.toISOString(),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
      }
    case 'week':
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      return {
        start: weekStart.toISOString(),
        end: today.toISOString()
      }
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return {
        start: monthStart.toISOString(),
        end: today.toISOString()
      }
    case 'quarter':
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      return {
        start: quarterStart.toISOString(),
        end: today.toISOString()
      }
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1)
      return {
        start: yearStart.toISOString(),
        end: today.toISOString()
      }
    case 'custom':
      return {
        start: start_date || today.toISOString(),
        end: end_date || today.toISOString()
      }
    default:
      return {
        start: today.toISOString(),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
      }
  }
}

interface DateRange {
  start: string;
  end: string;
}

async function generateDashboardReport(restaurant_id: string, dateRange: DateRange) {
  // Get key metrics
  const [customers, campaigns, messages, orders] = await Promise.all([
    // Total customers
    supabase.from('customers').select('id').eq('restaurant_id', restaurant_id),
    
    // Campaigns in period
    supabase.from('campaigns')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end),
    
    // Messages sent in period
    supabase.from('messages')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .gte('sent_at', dateRange.start)
      .lte('sent_at', dateRange.end),
    
    // Simulated orders data (would come from POS integration)
    supabase.from('orders')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)
  ])

  const totalCustomers = customers.data?.length || 0
  const totalCampaigns = campaigns.data?.length || 0
  const totalMessages = messages.data?.length || 0
  const totalOrders = orders.data?.length || 0
  const totalRevenue = orders.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

  // Calculate rates
  const openRate = messages.data?.filter(m => m.status === 'opened').length / Math.max(totalMessages, 1) * 100
  const clickRate = messages.data?.filter(m => m.status === 'clicked').length / Math.max(totalMessages, 1) * 100
  const conversionRate = totalOrders / Math.max(totalMessages, 1) * 100

  return {
    period: dateRange,
    metrics: {
      total_customers: totalCustomers,
      total_campaigns: totalCampaigns,
      total_messages: totalMessages,
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      open_rate: openRate,
      click_rate: clickRate,
      conversion_rate: conversionRate
    },
    campaign_performance: campaigns.data?.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      sent_count: c.sent_count || 0,
      open_rate: c.open_rate || 0,
      click_rate: c.click_rate || 0
    })),
    daily_stats: await getDailyStats(restaurant_id, dateRange)
  }
}

async function generateSalesReport(restaurant_id: string, dateRange: DateRange) {
  const { data: orders } = await supabase.from('orders')
    .select('*')
    .eq('restaurant_id', restaurant_id)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end)
    .order('created_at', { ascending: false })

  const totalSales = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
  const averageOrderValue = totalSales / Math.max(orders?.length || 0, 1)

  return {
    period: dateRange,
    summary: {
      total_orders: orders?.length || 0,
      total_sales: totalSales,
      average_order_value: averageOrderValue
    },
    orders: orders || [],
    sales_by_day: groupOrdersByDay(orders || []),
    top_products: getTopProducts(orders || [])
  }
}

async function generateCampaignsReport(restaurant_id: string, dateRange: DateRange) {
  const { data: campaigns } = await supabase.from('campaigns')
    .select(`
      *,
      messages (*)
    `)
    .eq('restaurant_id', restaurant_id)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end)

  return {
    period: dateRange,
    summary: {
      total_campaigns: campaigns?.length || 0,
      total_messages_sent: campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0,
      average_open_rate: campaigns?.reduce((sum, c) => sum + (c.open_rate || 0), 0) / Math.max(campaigns?.length || 0, 1) || 0
    },
    campaigns: campaigns?.map(c => ({
      ...c,
      performance: {
        sent: c.sent_count || 0,
        opened: c.messages?.filter((m: any) => m.status === 'opened').length || 0,
        clicked: c.messages?.filter((m: any) => m.status === 'clicked').length || 0,
        converted: c.messages?.filter((m: any) => m.status === 'converted').length || 0
      }
    })) || []
  }
}

async function generateCustomersReport(restaurant_id: string, dateRange: DateRange) {
  const { data: customers } = await supabase.from('customers')
    .select(`
      *,
      messages (*),
      orders (*)
    `)
    .eq('restaurant_id', restaurant_id)

  const newCustomers = customers?.filter(c => 
    new Date(c.created_at) >= new Date(dateRange.start) && 
    new Date(c.created_at) <= new Date(dateRange.end)
  ) || []

  return {
    period: dateRange,
    summary: {
      total_customers: customers?.length || 0,
      new_customers: newCustomers.length,
      active_customers: customers?.filter(c => (c.orders?.length || 0) > 0).length || 0
    },
    customers: customers?.map(c => ({
      ...c,
      stats: {
        total_orders: c.orders?.length || 0,
        total_spent: c.orders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0,
        messages_received: c.messages?.length || 0,
        last_order: c.orders?.[0]?.created_at || null
      }
    })) || [],
    customer_segments: getCustomerSegments(customers || [])
  }
}

async function getDailyStats(restaurant_id: string, dateRange: any) {
  // Generate daily statistics for charts
  const days = []
  const start = new Date(dateRange.start)
  const end = new Date(dateRange.end)
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayStart = new Date(d)
    const dayEnd = new Date(d.getTime() + 24 * 60 * 60 * 1000)
    
    const [messages, orders] = await Promise.all([
      supabase.from('messages')
        .select('*')
        .eq('restaurant_id', restaurant_id)
        .gte('sent_at', dayStart.toISOString())
        .lt('sent_at', dayEnd.toISOString()),
      
      supabase.from('orders')
        .select('*')
        .eq('restaurant_id', restaurant_id)
        .gte('created_at', dayStart.toISOString())
        .lt('created_at', dayEnd.toISOString())
    ])
    
    days.push({
      date: dayStart.toISOString().split('T')[0],
      messages_sent: messages.data?.length || 0,
      orders: orders.data?.length || 0,
      revenue: orders.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
    })
  }
  
  return days
}

interface Order {
  created_at: string;
  total?: number;
  items?: Array<{
    product_id: string;
    name: string;
    quantity: number;
    total?: number;
  }>;
}

function groupOrdersByDay(orders: Order[]) {
  const groups: Record<string, { date: string; orders: number; revenue: number }> = {}
  
  orders.forEach(order => {
    const date = order.created_at.split('T')[0]
    if (!groups[date]) {
      groups[date] = {
        date,
        orders: 0,
        revenue: 0
      }
    }
    groups[date].orders++
    groups[date].revenue += order.total || 0
  })
  
  return Object.values(groups)
}

interface ProductSummary {
  name: string;
  quantity: number;
  revenue: number;
}

function getTopProducts(orders: Order[]) {
  const products: Record<string, ProductSummary> = {}
  
  orders.forEach(order => {
    if (order.items) {
      order.items.forEach((item: any) => {
        if (!products[item.product_id]) {
          products[item.product_id] = {
            name: item.name,
            quantity: 0,
            revenue: 0
          }
        }
        products[item.product_id].quantity += item.quantity
        products[item.product_id].revenue += item.total || 0
      })
    }
  })
  
  return Object.values(products)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 10)
}

interface Customer {
  created_at: string;
  orders?: Order[];
}

function getCustomerSegments(customers: Customer[]) {
  const segments = {
    new: customers.filter(c => {
      const createdAt = new Date(c.created_at)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return createdAt > thirtyDaysAgo
    }).length,
    active: customers.filter(c => (c.orders?.length || 0) > 0).length,
    inactive: customers.filter(c => (c.orders?.length || 0) === 0).length,
    vip: customers.filter(c => {
      const totalSpent = c.orders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0
      return totalSpent > 1000
    }).length
  }
  
  return segments
}

async function exportReport(data: any, format: string, type: string) {
  const fileName = `${type}_report_${new Date().toISOString().split('T')[0]}.${format}`
  
  if (format === 'csv') {
    const csv = convertToCSV(data)
    
    // Upload to Supabase Storage
    const { data: uploadData, error } = await supabase.storage
      .from('reports')
      .upload(fileName, new Blob([csv], { type: 'text/csv' }))
    
    if (error) throw error
    
    const { data: urlData } = supabase.storage
      .from('reports')
      .getPublicUrl(fileName)
    
    return {
      name: fileName,
      url: urlData.publicUrl
    }
  }
  
  // For PDF, you would integrate with a PDF generation service
  // For now, return JSON download
  const json = JSON.stringify(data, null, 2)
  
  const { data: uploadData, error } = await supabase.storage
    .from('reports')
    .upload(fileName.replace('.pdf', '.json'), new Blob([json], { type: 'application/json' }))
  
  if (error) throw error
  
  const { data: urlData } = supabase.storage
    .from('reports')
    .getPublicUrl(fileName.replace('.pdf', '.json'))
  
  return {
    name: fileName.replace('.pdf', '.json'),
    url: urlData.publicUrl
  }
}

function convertToCSV(data: any): string {
  // Basic CSV conversion - you'd want to customize this based on report type
  if (Array.isArray(data)) {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    ).join('\n')
    
    return `${headers}\n${rows}`
  }
  
  // For complex objects, flatten to key-value pairs
  const pairs = Object.entries(data).map(([key, value]) => 
    `"${key}","${typeof value === 'object' ? JSON.stringify(value) : value}"`
  ).join('\n')
  
  return `"Key","Value"\n${pairs}`
}