import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Check if any user exists
    const userCount = await prisma.user.count();
    return NextResponse.json({ userExists: userCount > 0 });
  } catch (error) {
    console.error("Error checking users:", error);
    return NextResponse.json({ error: "Failed to check users" }, { status: 500 });
  }
}

// src/app/api/users/setup/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    // Check if any user already exists
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json(
        { error: "Setup already completed" }, 
        { status: 400 }
      );
    }

    const { name, username, email, password } = await request.json();

    // Validate input
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" }, 
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        passwordHash
      }
    });

    // Return success without password hash
    return NextResponse.json(
      { 
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    
    // Handle duplicate key errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `${error.meta.target[0]} already exists` }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create user" }, 
      { status: 500 }
    );
  }
}
