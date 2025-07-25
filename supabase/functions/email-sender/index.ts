import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import AWS from 'https://esm.sh/aws-sdk@2.1691.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailMessage {
  to: string
  subject: string
  html_content: string
  text_content?: string
  template_id?: string
  template_data?: Record<string, any>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html_content, text_content, template_id, template_data } = await req.json() as EmailMessage

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      throw new Error('Invalid email address format')
    }

    // Initialize AWS SES
    const awsConfig = {
      accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
      secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
      region: Deno.env.get('AWS_SES_REGION') || 'us-east-1',
    }

    const ses = new AWS.SES(awsConfig)
    const senderEmail = Deno.env.get('SES_SENDER_EMAIL')!
    const replyToEmail = Deno.env.get('SES_REPLY_TO_EMAIL')!

    let result

    if (template_id) {
      // Send using SES template
      const params = {
        Source: senderEmail,
        Destination: {
          ToAddresses: [to]
        },
        Template: template_id,
        TemplateData: JSON.stringify(template_data || {}),
        ReplyToAddresses: [replyToEmail]
      }

      result = await ses.sendTemplatedEmail(params).promise()
    } else {
      // Send regular email
      const params = {
        Source: senderEmail,
        Destination: {
          ToAddresses: [to]
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          },
          Body: {
            Html: {
              Data: html_content,
              Charset: 'UTF-8'
            },
            ...(text_content && {
              Text: {
                Data: text_content,
                Charset: 'UTF-8'
              }
            })
          }
        },
        ReplyToAddresses: [replyToEmail]
      }

      result = await ses.sendEmail(params).promise()
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: result.MessageId,
        to,
        subject: template_id ? `Template: ${template_id}` : subject
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})