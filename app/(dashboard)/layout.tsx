import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DashboardNav from "@/components/dashboard/dashboard-nav"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import Breadcrumbs from "@/components/dashboard/breadcrumbs"
import { TenantThemeProvider } from "@/components/tenant/tenant-theme-provider"
import { PageAnimatePresence } from "@/components/dashboard/page-animate-presence"
import { ThemeCustomizer } from "@/components/dashboard/theme-customizer"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: {
      name: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      backgroundColor: true,
      fontFamily: true,
      customCSS: true,
      logo: true,
    },
  })

  const branding = {
    primaryColor: tenant?.primaryColor || undefined,
    secondaryColor: tenant?.secondaryColor || undefined,
    accentColor: tenant?.accentColor || undefined,
    backgroundColor: tenant?.backgroundColor || undefined,
    fontFamily: tenant?.fontFamily || undefined,
    customCSS: tenant?.customCSS || undefined,
    logo: tenant?.logo || undefined,
  }

  return (
    <TenantThemeProvider branding={branding}>
      <div className="flex h-screen bg-transparent">
        <DashboardNav userRole={session.user.role} />
        <div className="flex flex-1 flex-col overflow-hidden bg-background">
          <DashboardHeader session={session} />
          <main className="flex-1 overflow-y-auto scrollbar-thin scroll-smooth">
            <div className="mx-auto min-h-screen px-4 py-8 md:px-12 md:py-10 max-w-[1600px]">
              <Breadcrumbs />
              <PageAnimatePresence>
                {children}
              </PageAnimatePresence>
            </div>
          </main>
        </div>
      </div>
      <ThemeCustomizer />
    </TenantThemeProvider>
  )
}


