"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search, Mail, MailOpen } from "lucide-react"
import { formatDistance } from "date-fns"

export default function MessagesTable({ messages }: { messages: any[] }) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMessages = messages.filter((msg) => {
    const query = searchQuery.toLowerCase()
    return msg.subject.toLowerCase().includes(query) || msg.sender.name?.toLowerCase().includes(query) || msg.content.toLowerCase().includes(query)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search messages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No messages found</TableCell>
              </TableRow>
            ) : (
              filteredMessages.map((message) => (
                <TableRow key={message.id} className={!message.isRead ? "bg-muted/50" : ""}>
                  <TableCell>
                    {message.isRead ? (
                      <MailOpen className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Mail className="h-4 w-4 text-primary" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className={!message.isRead ? "font-semibold" : ""}>{message.sender.name}</div>
                    <div className="text-xs text-muted-foreground">{message.sender.role}</div>
                  </TableCell>
                  <TableCell className={!message.isRead ? "font-semibold" : ""}>{message.subject}</TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground text-sm">{message.content}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistance(new Date(message.createdAt), new Date(), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/messages/${message.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
