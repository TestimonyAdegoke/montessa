"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Paintbrush,
  Save,
  Type,
  Palette,
  Square,
  Maximize,
  Sun,
  Moon,
} from "lucide-react"
import { updateSiteTheme } from "@/lib/actions/website-builder"

interface ThemeData {
  id: string
  siteId: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  mutedColor: string
  headingFont: string
  bodyFont: string
  monoFont: string
  borderRadius: string
  buttonRadius: string
  cardRadius: string
  buttonStyle: string
  shadowStyle: string
  spacingScale: string
  containerWidth: string
  customCSS: string | null
  darkMode: boolean
}

interface Props {
  siteId: string
  theme: ThemeData | null
}

const FONT_OPTIONS = [
  "Inter", "Poppins", "Roboto", "Open Sans", "Lato", "Montserrat",
  "Playfair Display", "Merriweather", "Source Sans Pro", "Nunito",
  "Raleway", "Work Sans", "DM Sans", "Plus Jakarta Sans", "Outfit",
]

const defaults: Omit<ThemeData, "id" | "siteId"> = {
  primaryColor: "#4F46E5",
  secondaryColor: "#7C3AED",
  accentColor: "#F59E0B",
  backgroundColor: "#FFFFFF",
  surfaceColor: "#F8FAFC",
  textColor: "#0F172A",
  mutedColor: "#64748B",
  headingFont: "Inter",
  bodyFont: "Inter",
  monoFont: "JetBrains Mono",
  borderRadius: "0.5rem",
  buttonRadius: "0.5rem",
  cardRadius: "0.75rem",
  buttonStyle: "solid",
  shadowStyle: "subtle",
  spacingScale: "default",
  containerWidth: "1280px",
  customCSS: null,
  darkMode: false,
}

export default function ThemeEditorClient({ siteId, theme }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    primaryColor: theme?.primaryColor || defaults.primaryColor,
    secondaryColor: theme?.secondaryColor || defaults.secondaryColor,
    accentColor: theme?.accentColor || defaults.accentColor,
    backgroundColor: theme?.backgroundColor || defaults.backgroundColor,
    surfaceColor: theme?.surfaceColor || defaults.surfaceColor,
    textColor: theme?.textColor || defaults.textColor,
    mutedColor: theme?.mutedColor || defaults.mutedColor,
    headingFont: theme?.headingFont || defaults.headingFont,
    bodyFont: theme?.bodyFont || defaults.bodyFont,
    monoFont: theme?.monoFont || defaults.monoFont,
    borderRadius: theme?.borderRadius || defaults.borderRadius,
    buttonRadius: theme?.buttonRadius || defaults.buttonRadius,
    cardRadius: theme?.cardRadius || defaults.cardRadius,
    buttonStyle: theme?.buttonStyle || defaults.buttonStyle,
    shadowStyle: theme?.shadowStyle || defaults.shadowStyle,
    spacingScale: theme?.spacingScale || defaults.spacingScale,
    containerWidth: theme?.containerWidth || defaults.containerWidth,
    customCSS: theme?.customCSS || "",
    darkMode: theme?.darkMode || false,
  })

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  function handleSave() {
    setError("")
    setSuccess(false)
    startTransition(async () => {
      try {
        await updateSiteTheme(form)
        setSuccess(true)
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to save theme")
      }
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Paintbrush className="h-6 w-6 text-primary" />
            Design System
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure your website&apos;s colors, typography, and visual style
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/website-builder"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
          </Button>
          <Button size="sm" className="gap-1" onClick={handleSave} disabled={isPending}>
            <Save className="h-4 w-4" />
            {isPending ? "Saving..." : "Save Theme"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-sm text-green-700 bg-green-500/10 rounded-lg px-3 py-2">Theme saved successfully!</p>}

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" /> Color Palette</CardTitle>
          <CardDescription>Define your brand colors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: "primaryColor", label: "Primary" },
              { key: "secondaryColor", label: "Secondary" },
              { key: "accentColor", label: "Accent" },
              { key: "backgroundColor", label: "Background" },
              { key: "surfaceColor", label: "Surface" },
              { key: "textColor", label: "Text" },
              { key: "mutedColor", label: "Muted Text" },
            ].map((c) => (
              <div key={c.key} className="space-y-1.5">
                <Label className="text-xs">{c.label}</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={(form as any)[c.key]}
                    onChange={(e) => update(c.key, e.target.value)}
                    className="h-9 w-9 rounded border cursor-pointer shrink-0"
                  />
                  <Input
                    value={(form as any)[c.key]}
                    onChange={(e) => update(c.key, e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Color Preview */}
          <div className="mt-6 p-4 rounded-xl border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Preview</p>
            <div className="flex gap-2 flex-wrap">
              {["primaryColor", "secondaryColor", "accentColor", "backgroundColor", "surfaceColor", "textColor", "mutedColor"].map((key) => (
                <div key={key} className="text-center">
                  <div className="w-12 h-12 rounded-lg border shadow-sm" style={{ backgroundColor: (form as any)[key] }} />
                  <p className="text-[9px] mt-1 text-muted-foreground">{key.replace("Color", "")}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Type className="h-4 w-4" /> Typography</CardTitle>
          <CardDescription>Choose fonts for headings and body text</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: "headingFont", label: "Heading Font" },
              { key: "bodyFont", label: "Body Font" },
              { key: "monoFont", label: "Mono Font" },
            ].map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-xs">{f.label}</Label>
                <Select value={(form as any)[f.key]} onValueChange={(v) => update(f.key, v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font} value={font} className="text-xs" style={{ fontFamily: font }}>{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-lg font-semibold" style={{ fontFamily: (form as any)[f.key] }}>
                  The quick brown fox
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Radius & Shapes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Square className="h-4 w-4" /> Shapes & Borders</CardTitle>
          <CardDescription>Control border radius and visual style</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: "borderRadius", label: "Border Radius", options: ["0", "0.25rem", "0.375rem", "0.5rem", "0.75rem", "1rem", "1.5rem", "9999px"] },
              { key: "buttonRadius", label: "Button Radius", options: ["0", "0.25rem", "0.375rem", "0.5rem", "0.75rem", "1rem", "9999px"] },
              { key: "cardRadius", label: "Card Radius", options: ["0", "0.5rem", "0.75rem", "1rem", "1.5rem", "2rem"] },
            ].map((r) => (
              <div key={r.key} className="space-y-1.5">
                <Label className="text-xs">{r.label}</Label>
                <Select value={(form as any)[r.key]} onValueChange={(v) => update(r.key, v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {r.options.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt || "None"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="h-12 w-full border-2 bg-primary/5" style={{ borderRadius: (form as any)[r.key], borderColor: form.primaryColor }} />
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Button Style</Label>
              <Select value={form.buttonStyle} onValueChange={(v) => update("buttonStyle", v)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Shadow Style</Label>
              <Select value={form.shadowStyle} onValueChange={(v) => update("shadowStyle", v)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="subtle">Subtle</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="strong">Strong</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Container Width</Label>
              <Select value={form.containerWidth} onValueChange={(v) => update("containerWidth", v)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024px">1024px (Narrow)</SelectItem>
                  <SelectItem value="1152px">1152px</SelectItem>
                  <SelectItem value="1280px">1280px (Default)</SelectItem>
                  <SelectItem value="1440px">1440px (Wide)</SelectItem>
                  <SelectItem value="1600px">1600px (Extra Wide)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dark Mode & Custom CSS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Sun className="h-4 w-4" /> Advanced</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Enable dark mode for your public website</p>
            </div>
            <Switch checked={form.darkMode} onCheckedChange={(v) => update("darkMode", v)} />
          </div>
          <Separator />
          <div className="space-y-1.5">
            <Label className="text-xs">Custom CSS</Label>
            <textarea
              value={form.customCSS}
              onChange={(e) => update("customCSS", e.target.value)}
              placeholder="/* Add custom CSS overrides here */"
              className="w-full px-3 py-2 text-xs font-mono rounded-md border bg-background resize-y min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" /> Live Preview</CardTitle>
          <CardDescription>See how your theme looks with sample content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: form.backgroundColor, fontFamily: form.bodyFont }}>
            {/* Mini Header */}
            <div className="px-6 py-3 flex items-center justify-between border-b" style={{ backgroundColor: form.surfaceColor }}>
              <span className="font-bold text-sm" style={{ color: form.textColor, fontFamily: form.headingFont }}>My School</span>
              <div className="flex items-center gap-4 text-xs" style={{ color: form.mutedColor }}>
                <span>Home</span><span>About</span><span>Admissions</span>
                <span className="px-3 py-1.5 text-white text-xs font-semibold" style={{ backgroundColor: form.primaryColor, borderRadius: form.buttonRadius }}>{form.buttonStyle === "outline" ? "" : "Apply Now"}</span>
              </div>
            </div>
            {/* Mini Hero */}
            <div className="px-6 py-10 text-center" style={{ background: `linear-gradient(135deg, ${form.primaryColor} 0%, ${form.secondaryColor} 100%)` }}>
              <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: form.headingFont }}>Welcome to Our School</h2>
              <p className="text-sm text-white/80 mb-4" style={{ fontFamily: form.bodyFont }}>Excellence in education since 2010</p>
              <span className="inline-block px-4 py-2 text-xs font-semibold" style={{ backgroundColor: form.accentColor, color: "#fff", borderRadius: form.buttonRadius }}>Get Started</span>
            </div>
            {/* Mini Features */}
            <div className="px-6 py-6 grid grid-cols-3 gap-3">
              {["Expert Teachers", "Modern Campus", "Small Classes"].map((title) => (
                <div key={title} className="p-3 border" style={{ borderRadius: form.cardRadius, boxShadow: form.shadowStyle === "none" ? "none" : form.shadowStyle === "subtle" ? "0 1px 3px rgba(0,0,0,0.06)" : form.shadowStyle === "medium" ? "0 4px 6px rgba(0,0,0,0.1)" : "0 10px 15px rgba(0,0,0,0.1)" }}>
                  <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs mb-2" style={{ backgroundColor: form.primaryColor, borderRadius: form.borderRadius }}>✓</div>
                  <p className="text-xs font-semibold" style={{ color: form.textColor, fontFamily: form.headingFont }}>{title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: form.mutedColor }}>Lorem ipsum dolor sit amet</p>
                </div>
              ))}
            </div>
            {/* Mini CTA */}
            <div className="px-6 py-4 text-center" style={{ backgroundColor: form.surfaceColor }}>
              <p className="text-xs" style={{ color: form.mutedColor }}>Ready to join?</p>
              <span className="inline-block mt-1 px-4 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: form.primaryColor, borderRadius: form.buttonRadius }}>Contact Us</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button (bottom) */}
      <div className="flex justify-end">
        <Button className="gap-1" onClick={handleSave} disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending ? "Saving..." : "Save Theme"}
        </Button>
      </div>
    </div>
  )
}
