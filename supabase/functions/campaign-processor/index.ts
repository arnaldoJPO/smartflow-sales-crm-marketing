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

// Initialize AWS services
const awsConfig = {
  accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
  secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
  region: Deno.env.get('AWS_REGION') || 'us-east-1',
}

const sqs = new AWS.SQS(awsConfig)
const ses = new AWS.SES(awsConfig)

interface Campaign {
  id: string
  name: string
  type: 'email' | 'whatsapp' | 'sms'
  message: string
  scheduled_at: string
  customer_segment: string[]
  template_id?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  restaurant_id: string
  created_by: string
}

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  tags: string[]
  restaurant_id: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { campaignId, action } = await req.json()

    if (action === 'send') {
      return await processCampaign(campaignId)
    } else if (action === 'schedule') {
      return await scheduleCampaign(campaignId)
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing campaign:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function processCampaign(campaignId: string) {
  // Get campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single()

  if (campaignError || !campaign) {
    throw new Error('Campaign not found')
  }

  // Update campaign status to sending
  await supabase
    .from('campaigns')
    .update({ status: 'sending', started_at: new Date().toISOString() })
    .eq('id', campaignId)

  // Get customers based on segment
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('*')
    .eq('restaurant_id', campaign.restaurant_id)
    .overlaps('tags', campaign.customer_segment)

  if (customersError) {
    throw new Error('Failed to fetch customers')
  }

  const results = {
    total: customers.length,
    sent: 0,
    failed: 0,
    errors: [] as string[]
  }

  // Process each customer
  for (const customer of customers) {
    try {
      await sendMessage(campaign, customer)
      results.sent++
      
      // Log message
      await supabase.from('messages').insert({
        campaign_id: campaignId,
        customer_id: customer.id,
        type: campaign.type,
        content: campaign.message,
        status: 'sent',
        sent_at: new Date().toISOString(),
        restaurant_id: campaign.restaurant_id
      })
    } catch (error) {
      results.failed++
      results.errors.push(`Customer ${customer.id}: ${error.message}`)
      
      // Log failed message
      await supabase.from('messages').insert({
        campaign_id: campaignId,
        customer_id: customer.id,
        type: campaign.type,
        content: campaign.message,
        status: 'failed',
        error: error.message,
        sent_at: new Date().toISOString(),
        restaurant_id: campaign.restaurant_id
      })
    }
  }

  // Update campaign status
  const finalStatus = results.failed === 0 ? 'sent' : 'partial'
  await supabase
    .from('campaigns')
    .update({ 
      status: finalStatus,
      completed_at: new Date().toISOString(),
      sent_count: results.sent,
      failed_count: results.failed
    })
    .eq('id', campaignId)

  return new Response(
    JSON.stringify({ success: true, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function sendMessage(campaign: Campaign, customer: Customer) {
  switch (campaign.type) {
    case 'email':
      return await sendEmail(campaign, customer)
    case 'whatsapp':
      return await queueWhatsApp(campaign, customer)
    case 'sms':
      return await queueSMS(campaign, customer)
    default:
      throw new Error(`Unsupported campaign type: ${campaign.type}`)
  }
}

async function sendEmail(campaign: Campaign, customer: Customer) {
  if (!customer.email) {
    throw new Error('Customer has no email address')
  }

  const params = {
    Source: Deno.env.get('SES_SENDER_EMAIL')!,
    Destination: {
      ToAddresses: [customer.email]
    },
    Message: {
      Subject: {
        Data: campaign.name,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: campaign.message.replace('{{name}}', customer.name),
          Charset: 'UTF-8'
        }
      }
    },
    ReplyToAddresses: [Deno.env.get('SES_REPLY_TO_EMAIL')!]
  }

  await ses.sendEmail(params).promise()
}

async function queueWhatsApp(campaign: Campaign, customer: Customer) {
  if (!customer.whatsapp && !customer.phone) {
    throw new Error('Customer has no WhatsApp/phone number')
  }

  const message = {
    campaignId: campaign.id,
    customerId: customer.id,
    to: customer.whatsapp || customer.phone,
    message: campaign.message.replace('{{name}}', customer.name),
    type: 'whatsapp'
  }

  const params = {
    QueueUrl: Deno.env.get('AWS_SQS_WHATSAPP_QUEUE_URL')!,
    MessageBody: JSON.stringify(message),
    MessageGroupId: campaign.id,
    MessageDeduplicationId: `${campaign.id}-${customer.id}-${Date.now()}`
  }

  await sqs.sendMessage(params).promise()
}

async function queueSMS(campaign: Campaign, customer: Customer) {
  if (!customer.phone) {
    throw new Error('Customer has no phone number')
  }

  const message = {
    campaignId: campaign.id,
    customerId: customer.id,
    to: customer.phone,
    message: campaign.message.replace('{{name}}', customer.name),
    type: 'sms'
  }

  const params = {
    QueueUrl: Deno.env.get('AWS_SQS_SMS_QUEUE_URL')!,
    MessageBody: JSON.stringify(message),
    MessageGroupId: campaign.id,
    MessageDeduplicationId: `${campaign.id}-${customer.id}-${Date.now()}`
  }

  await sqs.sendMessage(params).promise()
}

async function scheduleCampaign(campaignId: string) {
  // Logic for scheduling campaigns (using AWS EventBridge or similar)
  // This would trigger the campaign at the specified time
  
  await supabase
    .from('campaigns')
    .update({ status: 'scheduled' })
    .eq('id', campaignId)

  return new Response(
    JSON.stringify({ success: true, message: 'Campaign scheduled successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}