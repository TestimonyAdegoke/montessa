import { NextRequest } from "next/server"
import { addConnection, removeConnection } from "@/lib/realtime"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) {
    return new Response("Missing userId", { status: 400 })
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`))

      addConnection(userId, controller)

      // Keep-alive ping every 30s
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {
          clearInterval(interval)
        }
      }, 30000)

      // Cleanup on close
      req.signal.addEventListener("abort", () => {
        clearInterval(interval)
        removeConnection(userId, controller)
        try { controller.close() } catch { /* already closed */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
