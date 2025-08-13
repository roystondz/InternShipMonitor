import { NextResponse } from "next/server"
import { PrismaClient} from "@prisma/client"
import bcrypt from "bcrypt"

enum Role {
  INTERN = "INTERN",
  MENTOR = "MENTOR",
  ADMIN = "ADMIN"
}

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role in Role ? role : "INTERN" // default to INTERN if invalid
      }
    })

    return NextResponse.json({ message: "User created successfully", user })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
