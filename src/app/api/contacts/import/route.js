import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parse } from "papaparse";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }
    
    // Get form data with the CSV file
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" }, 
        { status: 400 }
      );
    }

    // Security check: Limit CSV file size to 1MB to prevent Denial of Service (DoS) via large uploads
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 1MB limit" },
        { status: 400 }
      );
    }
    
    // Read the file as text
    const csvText = await file.text();
    
    // Parse CSV data
    const { data } = parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "CSV file is empty or invalid" }, 
        { status: 400 }
      );
    }

    // Security check: Limit total rows to 100 to prevent resource exhaustion and DoS
    if (data.length > 100) {
      return NextResponse.json(
        { error: "CSV contains too many rows (max 100 rows per import)" },
        { status: 400 }
      );
    }
    
    // Process and insert contacts
    const createdContacts = [];
    
    for (const row of data) {
      const rawName = String(row.name || row.fullname || "").trim();
      const rawPhone = String(row.phone || row.phonenumber || row.mobile || "").trim();
      const rawEmail = String(row.email || "").trim();
      const rawGroup = String(row.group || row.category || "General").trim();

      // Skip empty rows
      if (!rawName && !rawPhone) {
        continue;
      }

      // Input sanitization & normalization to protect database integrity and handle DoS
      const normalizedDigits = rawPhone.replace(/\D/g, "");
      const formattedPhone = normalizedDigits ? `+${normalizedDigits}` : "";

      const contact = {
        name: rawName.slice(0, 100),
        phoneNumber: formattedPhone.slice(0, 50),
        email: rawEmail ? rawEmail.slice(0, 255) : null,
        group: rawGroup ? rawGroup.slice(0, 50) : "General"
      };
      
      // Create contact in database
      const createdContact = await prisma.contact.create({
        data: contact
      });
      
      createdContacts.push(createdContact);
    }
    
    return NextResponse.json({
      message: `Successfully imported ${createdContacts.length} contacts`,
      count: createdContacts.length
    });
    
  } catch (error) {
    console.error("Error importing contacts:", error);
    return NextResponse.json(
      { error: "Failed to import contacts" }, 
      { status: 500 }
    );
  }
}
