"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Loader2, ShieldCheck, Copy, Check } from "lucide-react"

export default function SecurityForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [twoFASetup, setTwoFASetup] = useState<{ secret: string; uri: string } | null>(null)
  const [verifyCode, setVerifyCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [twoFALoading, setTwoFALoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Check current 2FA status
    fetch("/api/auth/two-factor")
      .then((r) => r.json())
      .then((data) => {
        if (data.enabled) setTwoFAEnabled(true)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" })
      return
    }

    if (formData.newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password")
      }

      toast({ title: "Success", description: "Password changed successfully" })
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetup2FA = async () => {
    setTwoFALoading(true)
    try {
      const res = await fetch("/api/auth/two-factor")
      const data = await res.json()
      if (data.secret && data.uri) {
        setTwoFASetup({ secret: data.secret, uri: data.uri })
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate 2FA secret", variant: "destructive" })
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleEnable2FA = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast({ title: "Error", description: "Enter a 6-digit code from your authenticator app", variant: "destructive" })
      return
    }

    setTwoFALoading(true)
    try {
      const res = await fetch("/api/auth/two-factor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable", code: verifyCode, secret: twoFASetup?.secret }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to enable 2FA")

      setTwoFAEnabled(true)
      setBackupCodes(data.backupCodes || [])
      setTwoFASetup(null)
      setVerifyCode("")
      toast({ title: "2FA Enabled", description: "Two-factor authentication is now active" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setTwoFALoading(false)
    }
  }

  const handleDisable2FA = async () => {
    setTwoFALoading(true)
    try {
      const res = await fetch("/api/auth/two-factor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to disable 2FA")

      setTwoFAEnabled(false)
      setBackupCodes([])
      toast({ title: "2FA Disabled", description: "Two-factor authentication has been disabled" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setTwoFALoading(false)
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">Current Password</Label>
          <Input
            id="current-password"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
            disabled={isLoading}
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={isLoading}
            minLength={8}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </div>
      </form>

      <Separator />

      {/* Two-Factor Authentication */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security using a TOTP authenticator app
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {twoFAEnabled && <Badge variant="success">Enabled</Badge>}
            <Switch
              checked={twoFAEnabled}
              onCheckedChange={(checked) => {
                if (checked) handleSetup2FA()
                else handleDisable2FA()
              }}
              disabled={twoFALoading}
            />
          </div>
        </div>

        {/* 2FA Setup Flow */}
        {twoFASetup && !twoFAEnabled && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div>
              <h4 className="font-semibold mb-1">Set up your authenticator</h4>
              <p className="text-sm text-muted-foreground">
                Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
                or manually enter the secret key.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 py-2">
              <div className="bg-white p-3 rounded-lg border">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(twoFASetup.uri)}`}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                />
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Or enter this key manually:</p>
                <code className="text-sm bg-muted px-3 py-1 rounded font-mono">
                  {twoFASetup.secret}
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verify-code">Verification Code</Label>
              <div className="flex gap-2">
                <Input
                  id="verify-code"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="max-w-[200px] font-mono text-center text-lg tracking-widest"
                />
                <Button onClick={handleEnable2FA} disabled={twoFALoading || verifyCode.length !== 6}>
                  {twoFALoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Enable
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Backup Codes */}
        {backupCodes.length > 0 && (
          <div className="border rounded-lg p-4 space-y-3 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-200">Save your backup codes</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Store these codes in a safe place. Each code can only be used once if you lose access to your authenticator.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, i) => (
                <code key={i} className="text-sm font-mono bg-white dark:bg-gray-900 px-3 py-1.5 rounded border text-center">
                  {code}
                </code>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={copyBackupCodes}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copied!" : "Copy All Codes"}
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Data Export (GDPR) */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base">Export Your Data</Label>
          <p className="text-sm text-muted-foreground">
            Download a copy of all your personal data (GDPR compliance)
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = "/api/auth/data-export"
          }}
        >
          Download Data
        </Button>
      </div>
    </div>
  )
}
