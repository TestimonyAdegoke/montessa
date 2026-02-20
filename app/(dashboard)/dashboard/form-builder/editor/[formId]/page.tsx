import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getForm } from "@/lib/actions/form-builder"
import FormEditor from "@/components/form-builder/form-editor"

interface Props {
  params: { formId: string }
}

export default async function FormEditorPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const form = await getForm(params.formId)

  return <FormEditor initialForm={JSON.parse(JSON.stringify(form))} />
}
