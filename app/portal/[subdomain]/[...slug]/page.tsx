import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Block } from "@/components/site-builder/types"
import { BLOCK_DEFINITIONS } from "@/components/site-builder/registry"

interface PortalPageProps {
  params: { subdomain: string; slug?: string[] }
}

// Server-side block renderer
function renderBlock(block: Block) {
  const def = BLOCK_DEFINITIONS[block.type]
  if (!def) return null
  
  const Component = def.component
  // Render without edit capabilities
  return (
    <Component
      key={block.id}
      block={block}
      onChange={() => {}}
      selected={false}
    />
  )
}

export default async function TenantSitePage({ params }: PortalPageProps) {
  const { subdomain, slug } = params
  const pageSlug = slug?.join('/') || ''

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    select: {
      id: true,
      name: true,
      subdomain: true,
      logo: true,
      primaryColor: true,
      fontFamily: true,
      status: true,
      settings: true,
    },
  })

  if (!tenant || tenant.status !== "ACTIVE") notFound()

  const tenantSettings = tenant.settings as any || {}
  
  // Check for multi-page site data
  const sitePages = tenantSettings.sitePages as any[] | undefined
  
  if (!sitePages || sitePages.length === 0) {
    // No multi-page site, redirect to main portal
    notFound()
  }

  // Find the requested page by slug
  const page = sitePages.find((p: any) => {
    if (pageSlug === '' && p.isHomePage) return true
    if (pageSlug === '' && p.slug === '') return true
    return p.slug === pageSlug
  })

  if (!page) notFound()

  // Use published blocks if available, otherwise draft
  const blocks: Block[] = page.publishedBlocks?.length > 0 
    ? page.publishedBlocks 
    : page.draftBlocks || []

  if (blocks.length === 0) notFound()

  return (
    <main 
      className="min-h-screen bg-background"
      style={{ 
        fontFamily: tenant.fontFamily || 'Inter',
        '--primary': tenant.primaryColor || '#3b82f6',
      } as React.CSSProperties}
    >
      {blocks.map(block => renderBlock(block))}
    </main>
  )
}

export async function generateMetadata({ params }: PortalPageProps) {
  const { subdomain } = params

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    select: { name: true, settings: true },
  })

  if (!tenant) return { title: "Page Not Found" }

  const tenantSettings = tenant.settings as any || {}
  const landingPage = tenantSettings.landingPagePublished || tenantSettings.landingPageDraft || tenantSettings.landingPage

  return {
    title: landingPage?.heroTitle ? `${landingPage.heroTitle} — ${tenant.name}` : tenant.name,
    description: landingPage?.heroDescription || `Welcome to ${tenant.name}`,
  }
}
