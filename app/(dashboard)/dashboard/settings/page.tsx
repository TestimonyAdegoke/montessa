import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import ProfileForm from "@/components/settings/profile-form"
import ThemeToggle from "@/components/settings/theme-toggle"
import SecurityForm from "@/components/settings/security-form"
import NotificationForm from "@/components/settings/notification-form"
import BrandingForm from "@/components/settings/branding-form"
import SchoolDetailsForm from "@/components/settings/school-details-form"
import { Settings, User, Bell, Shield, Palette, Building, Paintbrush, GraduationCap, Sparkles, AlertTriangle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import dynamic from "next/dynamic"
const TenantSettingsForm = dynamic(() => import("@/components/settings/tenant-settings-form"), { ssr: false })

export default async function SettingsPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const isAdmin = ["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)

  // Fetch tenant data for school details & branding
  const tenant = isAdmin
    ? await prisma.tenant.findUnique({
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
    : null

  const initialTab = searchParams?.tab || "profile"

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Administration</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1.5">Manage your account, school, and application settings</p>
      </div>

      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList className="h-11 rounded-xl bg-muted/50 p-1 border border-border/30 flex-wrap">
          <TabsTrigger value="profile" className="rounded-lg px-4 font-semibold data-[state=active]:shadow-sm">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="school" className="rounded-lg px-4 font-semibold data-[state=active]:shadow-sm">
              <GraduationCap className="h-4 w-4 mr-2" />
              School
            </TabsTrigger>
          )}
          <TabsTrigger value="notifications" className="rounded-lg px-4 font-semibold data-[state=active]:shadow-sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg px-4 font-semibold data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg px-4 font-semibold data-[state=active]:shadow-sm">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="tenant" className="rounded-lg px-4 font-semibold data-[state=active]:shadow-sm">
            <Building className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="branding" className="rounded-lg px-4 font-semibold data-[state=active]:shadow-sm">
              <Paintbrush className="h-4 w-4 mr-2" />
              Branding
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <Card className="rounded-2xl border-border/40 shadow-lg bg-background/80 backdrop-blur-sm">
            <CardHeader className="border-b border-border/30 bg-muted/10">
              <CardTitle className="text-lg font-bold">Profile Information</CardTitle>
              <CardDescription>Update your account profile information</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ProfileForm initialName={session.user.name} initialEmail={session.user.email} />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && tenant && (
          <TabsContent value="school">
            <Card className="rounded-2xl border-border/40 shadow-lg bg-background/80 backdrop-blur-sm">
              <CardHeader className="border-b border-border/30 bg-muted/10">
                <CardTitle className="text-lg font-bold">School Details</CardTitle>
                <CardDescription>Manage your school&apos;s name, logo, and basic information</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <SchoolDetailsForm
                  tenantId={tenant.id}
                  initialData={{
                    name: tenant.name,
                    subdomain: tenant.subdomain,
                    domain: tenant.domain,
                    logo: tenant.logo,
                    tagline: tenant.tagline,
                    plan: tenant.plan,
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="tenant">
          <Card className="rounded-2xl border-border/40 shadow-lg bg-background/80 backdrop-blur-sm">
            <CardHeader className="border-b border-border/30 bg-muted/10">
              <CardTitle className="text-lg font-bold">Tenant Configuration</CardTitle>
              <CardDescription>Configure defaults for your organization</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <TenantSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="rounded-2xl border-border/40 shadow-lg bg-background/80 backdrop-blur-sm">
            <CardHeader className="border-b border-border/30 bg-muted/10">
              <CardTitle className="text-lg font-bold">Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <NotificationForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="rounded-2xl border-border/40 shadow-lg bg-background/80 backdrop-blur-sm">
            <CardHeader className="border-b border-border/30 bg-muted/10">
              <CardTitle className="text-lg font-bold">Security Settings</CardTitle>
              <CardDescription>Manage your password and security options</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <SecurityForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="rounded-2xl border-border/40 shadow-lg bg-background/80 backdrop-blur-sm">
            <CardHeader className="border-b border-border/30 bg-muted/10">
              <CardTitle className="text-lg font-bold">Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Theme</Label>
                <ThemeToggle />
              </div>
              <Separator className="bg-border/30" />
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Language</Label>
                <Input defaultValue="English" disabled className="rounded-xl h-11 border-muted-foreground/10 bg-muted/30" />
              </div>
              <Separator className="bg-border/30" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Show more content with reduced spacing
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="branding">
            {tenant ? (
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
              />
            ) : (
              <div className="p-6 border border-destructive/30 bg-destructive/10 text-destructive rounded-xl flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 mt-0.5" />
                <div>
                  <h3 className="font-bold text-lg">Tenant Record Not Found</h3>
                  <p className="opacity-90 mt-1 mb-4">
                    Your user account is associated with Tenant ID <code>{session.user.tenantId}</code>,
                    but this record does not exist in the database.
                  </p>
                  <Button variant="destructive" asChild>
                    <a href="/api/auth/signout">Sign Out & Reset Session</a>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
