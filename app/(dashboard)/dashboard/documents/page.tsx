"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload, Search, Folder, Image, File, Trash2 } from "lucide-react"

interface Document {
  id: string
  name: string
  url: string
  type: string
  category: string
  uploadedAt: string
  size: string
}

const CATEGORIES = [
  { value: "all", label: "All Documents" },
  { value: "student", label: "Student Records" },
  { value: "admission", label: "Admission Documents" },
  { value: "medical", label: "Medical Records" },
  { value: "academic", label: "Academic Documents" },
  { value: "other", label: "Other" },
]

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <Image className="h-5 w-5 text-blue-500" />
  if (type === "application/pdf") return <FileText className="h-5 w-5 text-red-500" />
  return <File className="h-5 w-5 text-gray-500" />
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [search, setSearch] = useState("")
  const [uploading, setUploading] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === "all" || doc.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i])
      }

      const res = await fetch("/api/uploadthing", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        const newDocs: Document[] = Array.isArray(data) ? data.map((f: any) => ({
          id: f.key || crypto.randomUUID(),
          name: f.name || "Untitled",
          url: f.url,
          type: f.type || "application/octet-stream",
          category: "other",
          uploadedAt: new Date().toISOString(),
          size: formatFileSize(f.size || 0),
        })) : []
        setDocuments((prev) => [...newDocs, ...prev])
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Vault</h1>
          <p className="text-muted-foreground">Upload and manage school documents</p>
        </div>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            onChange={handleFileUpload}
          />
          <Button asChild disabled={uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Files"}
            </label>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">{filteredDocs.length} documents</Badge>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>{cat.label}</TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.value} value={cat.value}>
            {filteredDocs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No documents found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {search ? "Try a different search term" : "Upload files to get started"}
                  </p>
                  <Button asChild variant="outline">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />Upload Files
                    </label>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{cat.label}</CardTitle>
                  <CardDescription>{filteredDocs.length} document(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.type)}
                          <div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm hover:underline"
                            >
                              {doc.name}
                            </a>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{doc.size}</span>
                              <span>·</span>
                              <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
