"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, CheckSquare, Square, Trash2, Download } from "lucide-react"

interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
  className?: string
}

interface SortableTableProps<T extends Record<string, any>> {
  data: T[]
  columns: Column<T>[]
  searchKey?: string
  searchPlaceholder?: string
  selectable?: boolean
  onBulkDelete?: (ids: string[]) => void
  onBulkExport?: (ids: string[]) => void
  idKey?: string
  className?: string
  emptyMessage?: string
}

export function SortableTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search...",
  selectable = false,
  onBulkDelete,
  onBulkExport,
  idKey = "id",
  className,
  emptyMessage = "No data found.",
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const pageSize = 20

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((r) => r[idKey])))
    }
  }

  let filtered = data
  if (search && searchKey) {
    const q = search.toLowerCase()
    filtered = data.filter((row) => {
      const val = row[searchKey]
      return val && String(val).toLowerCase().includes(q)
    })
  }

  if (sortKey) {
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? ""
      const bVal = b[sortKey] ?? ""
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortDir === "asc" ? cmp : -cmp
    })
  }

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)
  const selectedArr = Array.from(selected)

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        {searchKey && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder={searchPlaceholder} value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} />
          </div>
        )}
        {selectable && selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
            {onBulkDelete && <Button size="sm" variant="destructive" onClick={() => onBulkDelete(selectedArr)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>}
            {onBulkExport && <Button size="sm" variant="outline" onClick={() => onBulkExport(selectedArr)}><Download className="h-3 w-3 mr-1" />Export</Button>}
          </div>
        )}
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {selectable && (
                <th className="p-3 w-10">
                  <button onClick={toggleAll} className="text-muted-foreground hover:text-foreground">
                    {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  </button>
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={cn("p-3 text-left font-medium", col.className)}>
                  {col.sortable ? (
                    <button onClick={() => handleSort(col.key)} className="flex items-center gap-1 hover:text-foreground text-muted-foreground">
                      {col.label}
                      {sortKey === col.key ? (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </button>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8 text-center text-muted-foreground">{emptyMessage}</td></tr>
            ) : paged.map((row, i) => (
              <tr key={row[idKey] || i} className={cn("border-t hover:bg-muted/30 transition-colors", selected.has(row[idKey]) && "bg-primary/5")}>
                {selectable && (
                  <td className="p-3">
                    <button onClick={() => toggleSelect(row[idKey])} className="text-muted-foreground hover:text-foreground">
                      {selected.has(row[idKey]) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                    </button>
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={cn("p-3", col.className)}>
                    {col.render ? col.render(row) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{filtered.length} total · Page {page + 1} of {totalPages}</p>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
