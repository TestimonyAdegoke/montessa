"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  ShieldCheck,
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  KeyRound,
  UserCheck,
  UserX,
  Shield,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import { getInitials, formatDate } from "@/lib/utils"
import {
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  bulkUpdateRole,
  bulkToggleActive,
} from "@/lib/actions/users"

const ALL_ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin", color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" },
  { value: "TENANT_ADMIN", label: "Tenant Admin", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  { value: "TEACHER", label: "Teacher", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  { value: "GUARDIAN", label: "Guardian", color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" },
  { value: "STUDENT", label: "Student", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  { value: "HOD", label: "Head of Dept", color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" },
  { value: "HR", label: "HR", color: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800" },
  { value: "FINANCE", label: "Finance", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
]

function getRoleBadge(role: string) {
  const r = ALL_ROLES.find((x) => x.value === role)
  return r || { value: role, label: role, color: "bg-gray-100 text-gray-700" }
}

interface UserRow {
  id: string
  name: string | null
  email: string
  role: string
  isActive: boolean
  image: string | null
  phone: string | null
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

interface Props {
  initialUsers: UserRow[]
  stats: { total: number; active: number; inactive: number; roleCounts: Record<string, number> }
  currentUserId: string
  currentUserRole: string
}

export default function UserManagementClient({ initialUsers, stats, currentUserId, currentUserRole }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [users, setUsers] = useState<UserRow[]>(initialUsers)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [resetPwOpen, setResetPwOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null)
  const [resetPwUser, setResetPwUser] = useState<UserRow | null>(null)

  // Form states
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formRole, setFormRole] = useState("TEACHER")
  const [formPhone, setFormPhone] = useState("")
  const [formActive, setFormActive] = useState(true)
  const [newPassword, setNewPassword] = useState("")

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false
    if (statusFilter === "ACTIVE" && !u.isActive) return false
    if (statusFilter === "INACTIVE" && u.isActive) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !(u.name || "").toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const allSelected = filteredUsers.length > 0 && filteredUsers.every((u) => selected.has(u.id))

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredUsers.map((u) => u.id)))
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function openCreate() {
    setFormName("")
    setFormEmail("")
    setFormPassword("")
    setFormRole("TEACHER")
    setFormPhone("")
    setFormActive(true)
    setError("")
    setCreateOpen(true)
  }

  function openEdit(user: UserRow) {
    setEditingUser(user)
    setFormName(user.name || "")
    setFormEmail(user.email)
    setFormRole(user.role)
    setFormPhone(user.phone || "")
    setFormActive(user.isActive)
    setError("")
    setEditOpen(true)
  }

  function openDelete(user: UserRow) {
    setDeletingUser(user)
    setError("")
    setDeleteOpen(true)
  }

  function openResetPw(user: UserRow) {
    setResetPwUser(user)
    setNewPassword("")
    setError("")
    setResetPwOpen(true)
  }

  async function handleCreate() {
    setError("")
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setError("Name, email, and password are required")
      return
    }
    startTransition(async () => {
      try {
        await createUser({
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          password: formPassword,
          role: formRole,
          phone: formPhone.trim() || undefined,
          isActive: formActive,
        })
        setCreateOpen(false)
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to create user")
      }
    })
  }

  async function handleUpdate() {
    if (!editingUser) return
    setError("")
    startTransition(async () => {
      try {
        await updateUser(editingUser.id, {
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          role: formRole,
          phone: formPhone.trim(),
          isActive: formActive,
        })
        setEditOpen(false)
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to update user")
      }
    })
  }

  async function handleDelete() {
    if (!deletingUser) return
    setError("")
    startTransition(async () => {
      try {
        await deleteUser(deletingUser.id)
        setDeleteOpen(false)
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to delete user")
      }
    })
  }

  async function handleResetPassword() {
    if (!resetPwUser) return
    setError("")
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    startTransition(async () => {
      try {
        await resetUserPassword(resetPwUser.id, newPassword)
        setResetPwOpen(false)
      } catch (e: any) {
        setError(e.message || "Failed to reset password")
      }
    })
  }

  async function handleBulkRole(role: string) {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    startTransition(async () => {
      try {
        await bulkUpdateRole(ids, role)
        setSelected(new Set())
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Bulk update failed")
      }
    })
  }

  async function handleBulkToggle(active: boolean) {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    startTransition(async () => {
      try {
        await bulkToggleActive(ids, active)
        setSelected(new Set())
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Bulk update failed")
      }
    })
  }

  const availableRoles = currentUserRole === "SUPER_ADMIN" ? ALL_ROLES : ALL_ROLES.filter((r) => r.value !== "SUPER_ADMIN")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage users, roles, and access permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/users/access-rights" className="gap-2">
              <Shield className="h-4 w-4" />
              Access Rights
            </Link>
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-xs text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-500/10">
                <Shield className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Object.keys(stats.roleCounts).length}</p>
                <p className="text-xs text-muted-foreground">Active Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map((r) => {
              const count = stats.roleCounts[r.value] || 0
              if (count === 0) return null
              return (
                <Badge key={r.value} variant="outline" className={`${r.color} gap-1.5 py-1 px-2.5`}>
                  {r.label}
                  <span className="font-bold">{count}</span>
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-muted/50 border">
              <span className="text-sm font-medium">{selected.size} selected</span>
              <Separator orientation="vertical" className="h-5" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    Change Role
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {availableRoles.map((r) => (
                    <DropdownMenuItem key={r.value} onClick={() => handleBulkRole(r.value)}>
                      {r.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => handleBulkToggle(true)}>
                <UserCheck className="h-3.5 w-3.5" />
                Activate
              </Button>
              <Button variant="outline" size="sm" className="gap-1 text-destructive" onClick={() => handleBulkToggle(false)}>
                <UserX className="h-3.5 w-3.5" />
                Deactivate
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Last Login</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const roleBadge = getRoleBadge(user.role)
                    const isSelf = user.id === currentUserId
                    return (
                      <TableRow key={user.id} className={selected.has(user.id) ? "bg-muted/50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(user.id)}
                            onCheckedChange={() => toggleOne(user.id)}
                            disabled={isSelf}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.image || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {getInitials(user.name || user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {user.name || "Unnamed"}
                                {isSelf && (
                                  <span className="ml-1.5 text-[10px] text-muted-foreground">(you)</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${roleBadge.color} text-xs`}>
                            {roleBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-xs gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 text-xs gap-1">
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.lastLoginAt ? (
                            <span className="text-xs text-muted-foreground">{formatDate(new Date(user.lastLoginAt))}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Never
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">{formatDate(new Date(user.createdAt))}</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(user)} className="gap-2">
                                <Pencil className="h-3.5 w-3.5" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openResetPw(user)} className="gap-2">
                                <KeyRound className="h-3.5 w-3.5" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {!isSelf && (
                                <DropdownMenuItem
                                  onClick={() => openDelete(user)}
                                  className="gap-2 text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Deactivate User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="border-t px-4 py-3 text-xs text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Create New User
            </DialogTitle>
            <DialogDescription>Add a new user to your organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="john@school.edu" />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Min 8 characters" />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+1 234 567 890" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={formActive} onCheckedChange={setFormActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit User
            </DialogTitle>
            <DialogDescription>Update user details and role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={formActive} onCheckedChange={setFormActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete / Deactivate Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Deactivate User
            </DialogTitle>
            <DialogDescription>
              This will deactivate <strong>{deletingUser?.name || deletingUser?.email}</strong>.
              They will no longer be able to log in. This action can be reversed.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPwOpen} onOpenChange={setResetPwOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{resetPwUser?.name || resetPwUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPwOpen(false)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={isPending}>
              {isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
