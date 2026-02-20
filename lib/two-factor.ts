import crypto from "crypto"

const TOTP_PERIOD = 30
const TOTP_DIGITS = 6

export function generateSecret(): string {
  const buffer = crypto.randomBytes(20)
  return base32Encode(buffer)
}

export function generateTOTPUri(secret: string, email: string, issuer: string = "OnebitMS"): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`
}

export function verifyTOTP(token: string, secret: string): boolean {
  const secretBuffer = base32Decode(secret)
  const now = Math.floor(Date.now() / 1000)

  // Check current and adjacent time windows for clock drift
  for (const offset of [-1, 0, 1]) {
    const counter = Math.floor((now + offset * TOTP_PERIOD) / TOTP_PERIOD)
    const expected = generateHOTP(secretBuffer, counter)
    if (expected === token) return true
  }

  return false
}

export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase()
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`)
  }
  return codes
}

function generateHOTP(secret: Buffer, counter: number): string {
  const counterBuffer = Buffer.alloc(8)
  for (let i = 7; i >= 0; i--) {
    counterBuffer[i] = counter & 0xff
    counter = counter >> 8
  }

  const hmac = crypto.createHmac("sha1", secret)
  hmac.update(counterBuffer)
  const hash = hmac.digest()

  const offset = hash[hash.length - 1] & 0x0f
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)

  const otp = binary % Math.pow(10, TOTP_DIGITS)
  return otp.toString().padStart(TOTP_DIGITS, "0")
}

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

function base32Encode(buffer: Buffer): string {
  let result = ""
  let bits = 0
  let value = 0

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]
    bits += 8

    while (bits >= 5) {
      result += BASE32_CHARS[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    result += BASE32_CHARS[(value << (5 - bits)) & 31]
  }

  return result
}

function base32Decode(encoded: string): Buffer {
  const cleaned = encoded.replace(/[=\s]/g, "").toUpperCase()
  const bytes: number[] = []
  let bits = 0
  let value = 0

  for (const char of cleaned) {
    const index = BASE32_CHARS.indexOf(char)
    if (index === -1) continue

    value = (value << 5) | index
    bits += 5

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return Buffer.from(bytes)
}
