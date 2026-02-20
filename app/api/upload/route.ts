import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const folder = (formData.get("folder") as string) || "general"

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = [
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
            "application/pdf",
            "image/x-icon", "image/vnd.microsoft.icon",
        ]
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "File type not supported" }, { status: 400 })
        }

        // Create unique filename
        const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`
        const hash = crypto.randomBytes(8).toString("hex")
        const safeName = `${Date.now()}-${hash}${ext}`

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), "public", "uploads", folder)
        await mkdir(uploadDir, { recursive: true })

        // Write file
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filePath = path.join(uploadDir, safeName)
        await writeFile(filePath, buffer)

        // Return public URL
        const url = `/uploads/${folder}/${safeName}`

        return NextResponse.json({ url, name: file.name, size: file.size })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
