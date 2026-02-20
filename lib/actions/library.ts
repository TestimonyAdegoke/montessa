"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getBooks(search?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const where: any = { tenantId: session.user.tenantId }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { author: { contains: search, mode: "insensitive" } },
      { isbn: { contains: search, mode: "insensitive" } },
    ]
  }

  return prisma.libraryBook.findMany({
    where,
    include: { BookLoan: { where: { status: "ISSUED" } } },
    orderBy: { title: "asc" },
  })
}

export async function createBook(data: {
  title: string
  author: string
  isbn?: string
  publisher?: string
  publishYear?: number
  category?: string
  subject?: string
  grade?: string
  totalCopies?: number
  shelfLocation?: string
  coverImage?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) throw new Error("Forbidden")

  const book = await prisma.libraryBook.create({
    data: {
      tenantId: session.user.tenantId,
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      publisher: data.publisher,
      publishYear: data.publishYear,
      category: data.category,
      subject: data.subject,
      grade: data.grade,
      totalCopies: data.totalCopies || 1,
      availableCopies: data.totalCopies || 1,
      shelfLocation: data.shelfLocation,
      coverImage: data.coverImage,
    },
  })

  revalidatePath("/dashboard/library")
  return book
}

export async function issueBook(data: {
  bookId: string
  borrowerId: string
  borrowerName: string
  borrowerType: string
  dueDate: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const book = await prisma.libraryBook.findUnique({ where: { id: data.bookId } })
  if (!book || book.availableCopies < 1) throw new Error("Book not available")

  const [loan] = await prisma.$transaction([
    prisma.bookLoan.create({
      data: {
        bookId: data.bookId,
        borrowerId: data.borrowerId,
        borrowerName: data.borrowerName,
        borrowerType: data.borrowerType,
        dueDate: new Date(data.dueDate),
      },
    }),
    prisma.libraryBook.update({
      where: { id: data.bookId },
      data: { availableCopies: { decrement: 1 } },
    }),
  ])

  revalidatePath("/dashboard/library")
  return loan
}

export async function returnBook(loanId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const loan = await prisma.bookLoan.findUnique({ where: { id: loanId } })
  if (!loan || loan.status !== "ISSUED") throw new Error("Loan not found or already returned")

  await prisma.$transaction([
    prisma.bookLoan.update({
      where: { id: loanId },
      data: { status: "RETURNED", returnedDate: new Date() },
    }),
    prisma.libraryBook.update({
      where: { id: loan.bookId },
      data: { availableCopies: { increment: 1 } },
    }),
  ])

  revalidatePath("/dashboard/library")
}

export async function getLoans(status?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const where: any = {}
  if (status) where.status = status

  return prisma.bookLoan.findMany({
    where,
    include: { LibraryBook: { select: { title: true, author: true, tenantId: true } } },
    orderBy: { issuedDate: "desc" },
  })
}

export async function deleteBook(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) throw new Error("Forbidden")

  await prisma.libraryBook.delete({ where: { id } })
  revalidatePath("/dashboard/library")
}
