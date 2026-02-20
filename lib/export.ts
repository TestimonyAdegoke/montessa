/**
 * Export data to CSV format and trigger download in the browser.
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) return

  const cols = columns || Object.keys(data[0]).map((key) => ({ key: key as keyof T, label: String(key) }))

  const header = cols.map((c) => `"${String(c.label)}"`).join(",")
  const rows = data.map((row) =>
    cols
      .map((c) => {
        const val = row[c.key]
        if (val === null || val === undefined) return ""
        if (val instanceof Date) return `"${val.toISOString()}"`
        if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`
        return String(val)
      })
      .join(",")
  )

  const csv = [header, ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.csv`
  link.click()

  URL.revokeObjectURL(url)
}

/**
 * Export data to JSON and trigger download.
 */
export function exportToJSON<T>(data: T[], filename: string) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.json`
  link.click()

  URL.revokeObjectURL(url)
}
