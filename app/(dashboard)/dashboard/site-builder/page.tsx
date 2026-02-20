import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import BrandingForm from "@/components/settings/branding-form"

export default async function SiteBuilderPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: {
      id: true, name: true, subdomain: true, domain: true,
      logo: true, primaryColor: true, secondaryColor: true,
      accentColor: true, backgroundColor: true, backgroundImage: true,
      loginBanner: true, favicon: true, tagline: true, customCSS: true,
      loginLayout: true, headerStyle: true, fontFamily: true,
      darkModeLogo: true, plan: true, settings: true,
    },
  })

  if (!tenant) redirect("/dashboard")

  return (
    <BrandingForm
      tenantId={session.user.tenantId}
      subdomain={tenant.subdomain}
      currentLogo={tenant.logo}
      currentColor={tenant.primaryColor}
      currentSecondaryColor={tenant.secondaryColor}
      currentAccentColor={tenant.accentColor}
      currentBackgroundColor={tenant.backgroundColor}
      currentBackgroundImage={tenant.backgroundImage}
      currentLoginBanner={tenant.loginBanner}
      currentFavicon={tenant.favicon}
      currentTagline={tenant.tagline}
      currentCustomCSS={tenant.customCSS}
      currentLoginLayout={tenant.loginLayout || undefined}
      currentHeaderStyle={tenant.headerStyle || undefined}
      currentFontFamily={tenant.fontFamily || undefined}
      currentDarkModeLogo={tenant.darkModeLogo}
      currentButtonStyle={(tenant.settings as any)?.buttonStyle}
      currentInputStyle={(tenant.settings as any)?.inputStyle}
      currentCardGlass={(tenant.settings as any)?.cardGlass}
      currentLandingPage={(tenant.settings as any)?.landingPageDraft || (tenant.settings as any)?.landingPagePublished || (tenant.settings as any)?.landingPage}
      dedicatedRoute={true}
    />
  )
}

export const metadata = {
  title: "Site Builder",
  description: "Build and manage your website",
}
