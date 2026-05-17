// src/app/api/contacts/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Get a single contact by ID
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { id } = await params;
  
  try {
    const contact = await prisma.contact.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });
    
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    
    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json({ error: "Failed to fetch contact" }, { status: 500 });
  }
}

// Update a contact
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { id } = await params;
  
  try {
    const { name, phoneNumber, email, group } = await request.json();
    
    if (!name || !phoneNumber) {
      return NextResponse.json({ error: "Name and phone number are required" }, { status: 400 });
    }
    
    // Normalize phone number format
    const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber.replace(/\D/g, "")}`;
    
    const { count } = await prisma.contact.updateMany({
      where: {
        id,
        userId: session.user.id
      },
      data: {
        name,
        phoneNumber: normalizedPhone,
        email: email || null,
        group: group || "Default"
      }
    });
    
    if (count === 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const updatedContact = await prisma.contact.findUnique({
      where: { id }
    });

    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error("Error updating contact:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

// Delete a contact
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { id } = await params;
  
  try {
    const { count } = await prisma.contact.deleteMany({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (count === 0) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
