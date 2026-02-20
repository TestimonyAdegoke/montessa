import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import ProfileForm from "@/components/settings/profile-form"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground">Update your account information</p>
      </div>
      <ProfileForm initialName={session.user.name} initialEmail={session.user.email} />
    </div>
  )
}
