import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

const FROM_EMAIL = process.env.SMTP_FROM || "noreply@onebitms.com"
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "OnebitMS"

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("SMTP not configured, skipping email to:", to)
    return { success: false, error: "SMTP not configured" }
  }

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    })
    return { success: true }
  } catch (error: any) {
    console.error("Send email error:", error)
    return { success: false, error: error.message }
  }
}

export async function sendNotificationEmail(
  to: string,
  title: string,
  body: string,
  actionUrl?: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a2e; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">${APP_NAME}</h1>
      </div>
      <div style="padding: 30px; background: #ffffff;">
        <h2 style="color: #1a1a2e; margin-top: 0;">${title}</h2>
        <p style="color: #555; line-height: 1.6;">${body}</p>
        ${actionUrl ? `<a href="${actionUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Details</a>` : ""}
      </div>
      <div style="padding: 20px; background: #f5f5f5; text-align: center; color: #999; font-size: 12px;">
        <p>This is an automated notification from ${APP_NAME}.</p>
      </div>
    </div>
  `

  return sendEmail({ to, subject: `${APP_NAME}: ${title}`, html })
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendNotificationEmail(
    to,
    "Password Reset Request",
    `You requested a password reset. Click the button below to reset your password. This link expires in 1 hour. If you didn't request this, please ignore this email.`,
    resetUrl
  )
}

export async function sendApplicationConfirmation(to: string, studentName: string, applicationId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return sendNotificationEmail(
    to,
    "Application Received",
    `Thank you for submitting an application for <strong>${studentName}</strong>. Your application ID is <strong>${applicationId}</strong>. We will review your application and get back to you soon.`,
    `${appUrl}/apply/status?id=${applicationId}`
  )
}
