import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { TenantLoginClient } from "@/components/tenant/tenant-login-client"

interface PortalPageProps {
  params: { subdomain: string }
}

export default async function TenantPortalPage({ params }: PortalPageProps) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: params.subdomain },
    select: {
      id: true,
      name: true,
      subdomain: true,
      logo: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      backgroundColor: true,
      backgroundImage: true,
      loginBanner: true,
      favicon: true,
      tagline: true,
      customCSS: true,
      loginLayout: true,
      fontFamily: true,
      darkModeLogo: true,
      status: true,
      settings: true,
    },
  })

  if (!tenant || tenant.status !== "ACTIVE") notFound()

  const tenantSettings = tenant.settings as any || {}

  const branding = {
    id: tenant.id,
    name: tenant.name,
    subdomain: tenant.subdomain,
    logo: tenant.logo,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    accentColor: tenant.accentColor,
    backgroundColor: tenant.backgroundColor,
    backgroundImage: tenant.backgroundImage,
    loginBanner: tenant.loginBanner,
    favicon: tenant.favicon,
    tagline: tenant.tagline,
    customCSS: tenant.customCSS,
    loginLayout: tenant.loginLayout || "centered",
    fontFamily: tenant.fontFamily,
    darkModeLogo: tenant.darkModeLogo,
    buttonStyle: tenantSettings.buttonStyle,
    inputStyle: tenantSettings.inputStyle,
    cardGlass: tenantSettings.cardGlass,
    // Prefer published landing page for the live portal, with graceful fallback
    landingPage: tenantSettings.landingPagePublished || tenantSettings.landingPage || tenantSettings.landingPageDraft,
  }

  return <TenantLoginClient branding={branding} />
}

export async function generateMetadata({ params }: PortalPageProps) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: params.subdomain },
    select: { name: true, tagline: true, favicon: true },
  })

  if (!tenant) return { title: "Portal Not Found" }

  return {
    title: `${tenant.name} — Login`,
    description: tenant.tagline || `Sign in to ${tenant.name}`,
    icons: tenant.favicon ? { icon: tenant.favicon } : undefined,
  }
}
