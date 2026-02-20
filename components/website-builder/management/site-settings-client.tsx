"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Settings,
  Save,
  Globe,
  Search,
  BarChart3,
  Link2,
  ExternalLink,
  Share2,
  Image,
} from "lucide-react"
import { updateSite } from "@/lib/actions/website-builder"

interface SiteData {
  id: string
  name: string
  mode: string
  subdomain: string | null
  customDomain: string | null
  faviconUrl: string | null
  ogImageUrl: string | null
  metaTitle: string | null
  metaDescription: string | null
  analyticsId: string | null
  isPublished: boolean
}

interface Props {
  site: SiteData
}

export default function SiteSettingsClient({ site }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: site.name || "",
    customDomain: site.customDomain || "",
    faviconUrl: site.faviconUrl || "",
    ogImageUrl: site.ogImageUrl || "",
    metaTitle: site.metaTitle || "",
    metaDescription: site.metaDescription || "",
    analyticsId: site.analyticsId || "",
  })

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  function handleSave() {
    setError("")
    setSuccess(false)
    startTransition(async () => {
      try {
        await updateSite({
          name: form.name || undefined,
          customDomain: form.customDomain || undefined,
          faviconUrl: form.faviconUrl || undefined,
          ogImageUrl: form.ogImageUrl || undefined,
          metaTitle: form.metaTitle || undefined,
          metaDescription: form.metaDescription || undefined,
          analyticsId: form.analyticsId || undefined,
        })
        setSuccess(true)
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to save settings")
      }
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Site Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Configure domain, SEO, and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/website-builder"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
          </Button>
          <Button size="sm" className="gap-1" onClick={handleSave} disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-sm text-green-700 bg-green-500/10 rounded-lg px-3 py-2">Settings saved!</p>}

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Site Name</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Mode</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{site.mode === "FULL_WEBSITE" ? "Full Website" : "Portal Only"}</Badge>
              <span className="text-xs text-muted-foreground">(Cannot be changed after creation)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Link2 className="h-4 w-4" /> Domain</CardTitle>
          <CardDescription>Configure how visitors access your site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Subdomain</Label>
            <div className="flex items-center gap-2">
              <Input value={site.subdomain || ""} disabled className="bg-muted" />
              <span className="text-sm text-muted-foreground shrink-0">.yourapp.com</span>
            </div>
            <p className="text-xs text-muted-foreground">This is your default URL</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Custom Domain</Label>
            <Input
              value={form.customDomain}
              onChange={(e) => update("customDomain", e.target.value)}
              placeholder="www.myschool.com"
            />
            <p className="text-xs text-muted-foreground">
              Point your domain&apos;s DNS CNAME record to <code className="bg-muted px-1 rounded">{site.subdomain}.yourapp.com</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" /> SEO</CardTitle>
          <CardDescription>Search engine optimization settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Meta Title</Label>
            <Input
              value={form.metaTitle}
              onChange={(e) => update("metaTitle", e.target.value)}
              placeholder="My School - Excellence in Education"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">{form.metaTitle.length}/60 characters</p>
          </div>
          <div className="space-y-2">
            <Label>Meta Description</Label>
            <textarea
              value={form.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)}
              placeholder="A brief description of your school for search engines..."
              maxLength={160}
              className="w-full px-3 py-2 text-sm rounded-md border bg-background resize-y min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">{form.metaDescription.length}/160 characters</p>
          </div>
          <div className="space-y-2">
            <Label>Favicon URL</Label>
            <Input
              value={form.faviconUrl}
              onChange={(e) => update("faviconUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* SEO Preview */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Search Preview</p>
            <div>
              <p className="text-blue-600 text-base font-medium truncate">{form.metaTitle || form.name || "Your School Name"}</p>
              <p className="text-green-700 text-xs truncate">{form.customDomain || `${site.subdomain}.yourapp.com`}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{form.metaDescription || "No description set"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Share2 className="h-4 w-4" /> Social Sharing</CardTitle>
          <CardDescription>Control how your site appears when shared on social media</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>OG Image URL</Label>
            <Input
              value={form.ogImageUrl}
              onChange={(e) => update("ogImageUrl", e.target.value)}
              placeholder="https://... (1200x630px recommended)"
            />
            <p className="text-xs text-muted-foreground">Image shown when your site is shared on Facebook, Twitter, etc.</p>
          </div>

          {/* Social Preview */}
          <div className="border rounded-lg overflow-hidden bg-muted/30">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-4 pt-3 mb-2">Social Preview</p>
            <div className="mx-4 mb-4 border rounded-lg overflow-hidden bg-white">
              <div className="aspect-[1200/630] bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                {form.ogImageUrl ? (
                  <img src={form.ogImageUrl} alt="OG" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Image className="h-8 w-8 mx-auto text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground mt-1">No image set</p>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground">{form.customDomain || `${site.subdomain}.yourapp.com`}</p>
                <p className="text-sm font-semibold truncate">{form.metaTitle || form.name || "Your School"}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{form.metaDescription || "No description"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Analytics</CardTitle>
          <CardDescription>Track visitor behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Google Analytics ID</Label>
            <Input
              value={form.analyticsId}
              onChange={(e) => update("analyticsId", e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground">Enter your Google Analytics 4 measurement ID</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="gap-1" onClick={handleSave} disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
