import React from "react"

import { hexToHSL } from "@/lib/utils"

interface TenantBranding {
  primaryColor?: string | null
  secondaryColor?: string | null
  accentColor?: string | null
  backgroundColor?: string | null
  fontFamily?: string | null
  customCSS?: string | null
}


export function TenantThemeProvider({
  branding,
  children,
}: {
  branding: TenantBranding
  children: React.ReactNode
}) {
  const themeStyles = `
    :root {
      ${branding.primaryColor ? `--primary: ${hexToHSL(branding.primaryColor)}; --ring: ${hexToHSL(branding.primaryColor)};` : ""}
      ${branding.secondaryColor ? `--secondary: ${hexToHSL(branding.secondaryColor)};` : ""}
      ${branding.accentColor ? `--accent: ${hexToHSL(branding.accentColor)};` : ""}
      ${branding.backgroundColor ? `--background: ${hexToHSL(branding.backgroundColor)}; --radius: 0.75rem;` : ""}
      ${branding.fontFamily ? `--font-sans: ${branding.fontFamily};` : ""}
    }
    ${branding.fontFamily ? `body { font-family: ${branding.fontFamily} !important; }` : ""}
    ${branding.customCSS || ""}
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      {children}
    </>
  )
}
