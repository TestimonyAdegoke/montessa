// SMS Provider Abstraction Layer
// Supports Twilio and Africa's Talking with fallback

type SMSProvider = "twilio" | "africastalking"

interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

const PROVIDER: SMSProvider = (process.env.SMS_PROVIDER as SMSProvider) || "twilio"

async function sendViaTwilio(to: string, body: string): Promise<SMSResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !from) {
    return { success: false, error: "Twilio not configured" }
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64")

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    })

    const data = await res.json()
    if (!res.ok) return { success: false, error: data.message || "Twilio error" }
    return { success: true, messageId: data.sid }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function sendViaAfricasTalking(to: string, body: string): Promise<SMSResult> {
  const apiKey = process.env.AT_API_KEY
  const username = process.env.AT_USERNAME
  const from = process.env.AT_SENDER_ID

  if (!apiKey || !username) {
    return { success: false, error: "Africa's Talking not configured" }
  }

  try {
    const url = "https://api.africastalking.com/version1/messaging"
    const params: Record<string, string> = { username, to, message: body }
    if (from) params.from = from

    const res = await fetch(url, {
      method: "POST",
      headers: {
        apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams(params).toString(),
    })

    const data = await res.json()
    const recipients = data?.SMSMessageData?.Recipients || []
    if (recipients.length > 0 && recipients[0].status === "Success") {
      return { success: true, messageId: recipients[0].messageId }
    }
    return { success: false, error: data?.SMSMessageData?.Message || "AT error" }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function sendSMS(to: string, body: string): Promise<SMSResult> {
  console.log(`[SMS] Sending to ${to} via ${PROVIDER}: ${body.substring(0, 50)}...`)

  if (PROVIDER === "africastalking") {
    return sendViaAfricasTalking(to, body)
  }
  return sendViaTwilio(to, body)
}

export async function sendBulkSMS(
  recipients: { phone: string; message: string }[]
): Promise<{ sent: number; failed: number; results: SMSResult[] }> {
  const results: SMSResult[] = []
  let sent = 0
  let failed = 0

  for (const r of recipients) {
    const result = await sendSMS(r.phone, r.message)
    results.push(result)
    if (result.success) sent++
    else failed++
  }

  return { sent, failed, results }
}

export function isSMSConfigured(): boolean {
  if (PROVIDER === "africastalking") {
    return !!(process.env.AT_API_KEY && process.env.AT_USERNAME)
  }
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)
}
