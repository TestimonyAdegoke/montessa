// Real-time messaging using Server-Sent Events (SSE)
// No external dependency needed — works with Next.js API routes

export type RealtimeEvent = {
  type: "message" | "notification" | "typing" | "presence" | "update"
  data: Record<string, any>
  channel?: string
  userId?: string
  timestamp: string
}

// Client-side: connect to SSE stream
export function createRealtimeConnection(
  userId: string,
  onEvent: (event: RealtimeEvent) => void,
  onError?: (error: Event) => void
): EventSource | null {
  if (typeof window === "undefined") return null

  const eventSource = new EventSource(`/api/realtime/stream?userId=${userId}`)

  eventSource.onmessage = (e) => {
    try {
      const event: RealtimeEvent = JSON.parse(e.data)
      onEvent(event)
    } catch {
      // ignore parse errors
    }
  }

  eventSource.onerror = (e) => {
    if (onError) onError(e)
    // Auto-reconnect is built into EventSource
  }

  return eventSource
}

// Client-side: send a message via POST
export async function sendRealtimeMessage(data: {
  recipientId: string
  content: string
  type?: string
}): Promise<boolean> {
  try {
    const res = await fetch("/api/realtime/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return res.ok
  } catch {
    return false
  }
}

// In-memory store for SSE connections (server-side)
// In production, use Redis pub/sub for multi-instance support
const connections = new Map<string, Set<ReadableStreamDefaultController>>()

export function addConnection(userId: string, controller: ReadableStreamDefaultController) {
  if (!connections.has(userId)) connections.set(userId, new Set())
  connections.get(userId)!.add(controller)
}

export function removeConnection(userId: string, controller: ReadableStreamDefaultController) {
  const userConns = connections.get(userId)
  if (userConns) {
    userConns.delete(controller)
    if (userConns.size === 0) connections.delete(userId)
  }
}

export function pushToUser(userId: string, event: RealtimeEvent) {
  const userConns = connections.get(userId)
  if (!userConns) return false

  const data = `data: ${JSON.stringify(event)}\n\n`
  const encoder = new TextEncoder()

  Array.from(userConns).forEach((controller) => {
    try {
      controller.enqueue(encoder.encode(data))
    } catch {
      userConns.delete(controller)
    }
  })
  return true
}

export function getOnlineUsers(): string[] {
  return Array.from(connections.keys())
}
