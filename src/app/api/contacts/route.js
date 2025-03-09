import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { name: "asc" }
    });
    
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { name, phoneNumber, email, group } = await request.json();
    
    if (!name || !phoneNumber) {
      return NextResponse.json({ error: "Name and phone number are required" }, { status: 400 });
    }
    
    // Normalize phone number format
    const normalizedPhone = phoneNumber.replace(/\D/g, "");
    
    const contact = await prisma.contact.create({
      data: {
        name,
        phoneNumber: normalizedPhone.startsWith("+") ? normalizedPhone : `+${normalizedPhone}`,
        email: email || null,
        group: group || "Default"
      }
    });
    
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}