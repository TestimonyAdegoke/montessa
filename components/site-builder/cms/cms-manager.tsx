"use client"

import { useState } from "react"
import { CMSCollection, CMSItem, CMSFieldDefinition, COLLECTION_TEMPLATES, FieldType } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
    Plus, Database, FileText, Users, Quote, Briefcase, Calendar, 
    HelpCircle, Package, Zap, Trash2, Edit, MoreHorizontal, Search,
    ArrowUpDown, Eye, EyeOff, GripVertical, Settings, Copy
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CMSManagerProps {
    collections: CMSCollection[]
    items: Record<string, CMSItem[]>
    onCreateCollection: (collection: Omit<CMSCollection, "id" | "createdAt" | "updatedAt">) => void
    onUpdateCollection: (id: string, collection: Partial<CMSCollection>) => void
    onDeleteCollection: (id: string) => void
    onCreateItem: (collectionId: string, data: Record<string, any>) => void
    onUpdateItem: (itemId: string, data: Record<string, any>) => void
    onDeleteItem: (itemId: string) => void
    onPublishItem: (itemId: string) => void
}

const FIELD_TYPES: { value: FieldType; label: string; icon: string }[] = [
    { value: "text", label: "Text", icon: "Aa" },
    { value: "richtext", label: "Rich Text", icon: "¶" },
    { value: "number", label: "Number", icon: "#" },
    { value: "boolean", label: "Boolean", icon: "✓" },
    { value: "date", label: "Date", icon: "📅" },
    { value: "datetime", label: "Date & Time", icon: "🕐" },
    { value: "image", label: "Image", icon: "🖼" },
    { value: "file", label: "File", icon: "📎" },
    { value: "url", label: "URL", icon: "🔗" },
    { value: "email", label: "Email", icon: "✉" },
    { value: "color", label: "Color", icon: "🎨" },
    { value: "select", label: "Select", icon: "▼" },
    { value: "multiselect", label: "Multi-Select", icon: "☑" },
    { value: "reference", label: "Reference", icon: "→" },
    { value: "json", label: "JSON", icon: "{}" },
]

const COLLECTION_ICONS: Record<string, any> = {
    FileText, Users, Quote, Briefcase, Calendar, HelpCircle, Package, Zap, Database
}

export const CMSManager = ({
    collections,
    items,
    onCreateCollection,
    onUpdateCollection,
    onDeleteCollection,
    onCreateItem,
    onUpdateItem,
    onDeleteItem,
    onPublishItem
}: CMSManagerProps) => {
    const [activeTab, setActiveTab] = useState<"collections" | "content">("collections")
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false)
    const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    
    // New collection form state
    const [newCollection, setNewCollection] = useState({
        name: "",
        slug: "",
        description: "",
        icon: "Database"
    })
    
    // New field form state
    const [newField, setNewField] = useState<Partial<CMSFieldDefinition>>({
        name: "",
        slug: "",
        type: "text",
        required: false
    })

    // New item form state
    const [newItemData, setNewItemData] = useState<Record<string, any>>({})

    const selectedCollectionData = collections.find(c => c.id === selectedCollection)
    const collectionItems = selectedCollection ? (items[selectedCollection] || []) : []

    const handleCreateFromTemplate = (template: Partial<CMSCollection>) => {
        onCreateCollection({
            name: template.name!,
            slug: template.slug!,
            description: template.description,
            icon: template.icon,
            fields: template.fields as CMSFieldDefinition[]
        })
        setIsCreateDialogOpen(false)
    }

    const handleCreateCollection = () => {
        if (!newCollection.name || !newCollection.slug) return
        onCreateCollection({
            name: newCollection.name,
            slug: newCollection.slug,
            description: newCollection.description,
            icon: newCollection.icon,
            fields: []
        })
        setNewCollection({ name: "", slug: "", description: "", icon: "Database" })
        setIsCreateDialogOpen(false)
    }

    const handleAddField = () => {
        if (!selectedCollection || !newField.name || !newField.slug) return
        const collection = collections.find(c => c.id === selectedCollection)
        if (!collection) return
        
        const field: CMSFieldDefinition = {
            id: Math.random().toString(36).substr(2, 9),
            name: newField.name,
            slug: newField.slug,
            type: newField.type as FieldType,
            required: newField.required || false,
            helpText: newField.helpText,
            options: newField.options
        }
        
        onUpdateCollection(selectedCollection, {
            fields: [...collection.fields, field]
        })
        setNewField({ name: "", slug: "", type: "text", required: false })
        setIsFieldDialogOpen(false)
    }

    const handleCreateItem = () => {
        if (!selectedCollection) return
        onCreateItem(selectedCollection, newItemData)
        setNewItemData({})
        setIsItemDialogOpen(false)
    }

    const filteredItems = collectionItems.filter(item => {
        if (!searchQuery) return true
        return Object.values(item.data).some(val => 
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
    })

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-lg">CMS</h2>
                </div>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="h-8">
                        <TabsTrigger value="collections" className="text-xs">Collections</TabsTrigger>
                        <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex-1 overflow-hidden">
                {activeTab === "collections" ? (
                    <div className="h-full flex">
                        {/* Collections List */}
                        <div className="w-64 border-r p-4 space-y-4">
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Collection
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Create Collection</DialogTitle>
                                        <DialogDescription>
                                            Start from a template or create a custom collection
                                        </DialogDescription>
                                    </DialogHeader>
                                    
                                    <Tabs defaultValue="templates">
                                        <TabsList className="w-full">
                                            <TabsTrigger value="templates" className="flex-1">Templates</TabsTrigger>
                                            <TabsTrigger value="custom" className="flex-1">Custom</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="templates" className="mt-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                {COLLECTION_TEMPLATES.map((template) => {
                                                    const Icon = COLLECTION_ICONS[template.icon || "Database"]
                                                    return (
                                                        <Card 
                                                            key={template.slug}
                                                            className="cursor-pointer hover:border-primary/50 transition-colors"
                                                            onClick={() => handleCreateFromTemplate(template)}
                                                        >
                                                            <CardHeader className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                        <Icon className="h-5 w-5 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <CardTitle className="text-sm">{template.name}</CardTitle>
                                                                        <CardDescription className="text-xs">
                                                                            {template.fields?.length} fields
                                                                        </CardDescription>
                                                                    </div>
                                                                </div>
                                                            </CardHeader>
                                                        </Card>
                                                    )
                                                })}
                                            </div>
                                        </TabsContent>
                                        
                                        <TabsContent value="custom" className="mt-4 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Name</Label>
                                                    <Input 
                                                        value={newCollection.name}
                                                        onChange={(e) => setNewCollection(prev => ({ 
                                                            ...prev, 
                                                            name: e.target.value,
                                                            slug: e.target.value.toLowerCase().replace(/\s+/g, "-")
                                                        }))}
                                                        placeholder="Blog Posts"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Slug</Label>
                                                    <Input 
                                                        value={newCollection.slug}
                                                        onChange={(e) => setNewCollection(prev => ({ ...prev, slug: e.target.value }))}
                                                        placeholder="blog-posts"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea 
                                                    value={newCollection.description}
                                                    onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                                                    placeholder="Describe this collection..."
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleCreateCollection}>Create Collection</Button>
                                            </DialogFooter>
                                        </TabsContent>
                                    </Tabs>
                                </DialogContent>
                            </Dialog>

                            <ScrollArea className="h-[calc(100%-60px)]">
                                <div className="space-y-2">
                                    {collections.map((collection) => {
                                        const Icon = COLLECTION_ICONS[collection.icon || "Database"]
                                        return (
                                            <motion.div
                                                key={collection.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={cn(
                                                    "p-3 rounded-lg cursor-pointer transition-colors",
                                                    selectedCollection === collection.id 
                                                        ? "bg-primary/10 border border-primary/20" 
                                                        : "hover:bg-muted"
                                                )}
                                                onClick={() => setSelectedCollection(collection.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">{collection.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {collection.fields.length} fields
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Collection Details */}
                        <div className="flex-1 p-6">
                            {selectedCollectionData ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold">{selectedCollectionData.name}</h3>
                                            <p className="text-sm text-muted-foreground">{selectedCollectionData.description}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Settings
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => onDeleteCollection(selectedCollectionData.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Fields */}
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">Fields</CardTitle>
                                                <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline">
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Add Field
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Add Field</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <Label>Name</Label>
                                                                    <Input 
                                                                        value={newField.name}
                                                                        onChange={(e) => setNewField(prev => ({ 
                                                                            ...prev, 
                                                                            name: e.target.value,
                                                                            slug: e.target.value.toLowerCase().replace(/\s+/g, "-")
                                                                        }))}
                                                                        placeholder="Title"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Slug</Label>
                                                                    <Input 
                                                                        value={newField.slug}
                                                                        onChange={(e) => setNewField(prev => ({ ...prev, slug: e.target.value }))}
                                                                        placeholder="title"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Type</Label>
                                                                <Select 
                                                                    value={newField.type}
                                                                    onValueChange={(v) => setNewField(prev => ({ ...prev, type: v as FieldType }))}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {FIELD_TYPES.map(ft => (
                                                                            <SelectItem key={ft.value} value={ft.value}>
                                                                                <span className="flex items-center gap-2">
                                                                                    <span className="w-5 text-center">{ft.icon}</span>
                                                                                    {ft.label}
                                                                                </span>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Switch 
                                                                    checked={newField.required}
                                                                    onCheckedChange={(v) => setNewField(prev => ({ ...prev, required: v }))}
                                                                />
                                                                <Label>Required</Label>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Help Text</Label>
                                                                <Input 
                                                                    value={newField.helpText || ""}
                                                                    onChange={(e) => setNewField(prev => ({ ...prev, helpText: e.target.value }))}
                                                                    placeholder="Optional help text..."
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button onClick={handleAddField}>Add Field</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {selectedCollectionData.fields.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-8">
                                                    No fields yet. Add your first field to define the content structure.
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {selectedCollectionData.fields.map((field, index) => (
                                                        <div 
                                                            key={field.id}
                                                            className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                                                        >
                                                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                                            <div className="w-8 h-8 rounded bg-background flex items-center justify-center text-xs font-mono">
                                                                {FIELD_TYPES.find(ft => ft.value === field.type)?.icon}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm">{field.name}</p>
                                                                <p className="text-xs text-muted-foreground">{field.type}</p>
                                                            </div>
                                                            {field.required && (
                                                                <Badge variant="secondary" className="text-[10px]">Required</Badge>
                                                            )}
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <div className="text-center space-y-2">
                                        <Database className="h-12 w-12 mx-auto opacity-20" />
                                        <p>Select a collection to view details</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Content Tab */
                    <div className="h-full flex">
                        {/* Collections Sidebar */}
                        <div className="w-56 border-r p-4">
                            <ScrollArea className="h-full">
                                <div className="space-y-1">
                                    {collections.map((collection) => {
                                        const Icon = COLLECTION_ICONS[collection.icon || "Database"]
                                        const itemCount = items[collection.id]?.length || 0
                                        return (
                                            <div
                                                key={collection.id}
                                                className={cn(
                                                    "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                                                    selectedCollection === collection.id 
                                                        ? "bg-primary/10" 
                                                        : "hover:bg-muted"
                                                )}
                                                onClick={() => setSelectedCollection(collection.id)}
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span className="flex-1 text-sm truncate">{collection.name}</span>
                                                <Badge variant="secondary" className="text-[10px]">{itemCount}</Badge>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Content List */}
                        <div className="flex-1 p-4">
                            {selectedCollectionData ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="Search content..."
                                                className="pl-9"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add {selectedCollectionData.name.replace(/s$/, "")}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>New {selectedCollectionData.name.replace(/s$/, "")}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    {selectedCollectionData.fields.map((field) => (
                                                        <div key={field.id} className="space-y-2">
                                                            <Label>
                                                                {field.name}
                                                                {field.required && <span className="text-destructive ml-1">*</span>}
                                                            </Label>
                                                            {field.type === "text" && (
                                                                <Input 
                                                                    value={newItemData[field.slug] || ""}
                                                                    onChange={(e) => setNewItemData(prev => ({ ...prev, [field.slug]: e.target.value }))}
                                                                />
                                                            )}
                                                            {field.type === "richtext" && (
                                                                <Textarea 
                                                                    value={newItemData[field.slug] || ""}
                                                                    onChange={(e) => setNewItemData(prev => ({ ...prev, [field.slug]: e.target.value }))}
                                                                    rows={4}
                                                                />
                                                            )}
                                                            {field.type === "number" && (
                                                                <Input 
                                                                    type="number"
                                                                    value={newItemData[field.slug] || ""}
                                                                    onChange={(e) => setNewItemData(prev => ({ ...prev, [field.slug]: parseFloat(e.target.value) }))}
                                                                />
                                                            )}
                                                            {field.type === "boolean" && (
                                                                <Switch 
                                                                    checked={newItemData[field.slug] || false}
                                                                    onCheckedChange={(v) => setNewItemData(prev => ({ ...prev, [field.slug]: v }))}
                                                                />
                                                            )}
                                                            {(field.type === "date" || field.type === "datetime") && (
                                                                <Input 
                                                                    type={field.type === "datetime" ? "datetime-local" : "date"}
                                                                    value={newItemData[field.slug] || ""}
                                                                    onChange={(e) => setNewItemData(prev => ({ ...prev, [field.slug]: e.target.value }))}
                                                                />
                                                            )}
                                                            {(field.type === "url" || field.type === "email" || field.type === "image") && (
                                                                <Input 
                                                                    type={field.type === "email" ? "email" : "url"}
                                                                    value={newItemData[field.slug] || ""}
                                                                    onChange={(e) => setNewItemData(prev => ({ ...prev, [field.slug]: e.target.value }))}
                                                                    placeholder={field.type === "image" ? "https://..." : undefined}
                                                                />
                                                            )}
                                                            {field.helpText && (
                                                                <p className="text-xs text-muted-foreground">{field.helpText}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>Cancel</Button>
                                                    <Button onClick={handleCreateItem}>Create</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Items Table */}
                                    {filteredItems.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Database className="h-12 w-12 mx-auto opacity-20 mb-4" />
                                            <p>No content yet</p>
                                            <p className="text-sm">Add your first item to get started</p>
                                        </div>
                                    ) : (
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        {selectedCollectionData.fields.slice(0, 4).map((field) => (
                                                            <th key={field.id} className="text-left p-3 text-sm font-medium">
                                                                {field.name}
                                                            </th>
                                                        ))}
                                                        <th className="text-left p-3 text-sm font-medium">Status</th>
                                                        <th className="w-20"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredItems.map((item) => (
                                                        <tr key={item.id} className="border-t hover:bg-muted/30">
                                                            {selectedCollectionData.fields.slice(0, 4).map((field) => (
                                                                <td key={field.id} className="p-3 text-sm">
                                                                    {String(item.data[field.slug] || "-").slice(0, 50)}
                                                                    {String(item.data[field.slug] || "").length > 50 && "..."}
                                                                </td>
                                                            ))}
                                                            <td className="p-3">
                                                                <Badge variant={item.status === "published" ? "default" : "secondary"}>
                                                                    {item.status}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex gap-1">
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="h-8 w-8"
                                                                        onClick={() => onDeleteItem(item.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <p>Select a collection to manage content</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
