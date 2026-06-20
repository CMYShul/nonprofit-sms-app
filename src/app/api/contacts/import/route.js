import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parse } from "papaparse";
import { prisma } from "@/lib/prisma";

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

    // Security: Limit file size to 1MB
    if (file.size > 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (limit: 1MB)" },
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

    // Security: Limit number of contacts to import at once
    if (data.length > 100) {
      return NextResponse.json(
        { error: "Too many contacts (limit: 100 per import)" },
        { status: 400 }
      );
    }
    
    // Process and insert contacts
    const createdContacts = [];
    
    for (const row of data) {
      // Map CSV fields to your contact model
      // Adjust field names based on your CSV structure
      const name = row.name || row.fullname || "";
      const rawPhone = row.phone || row.phonenumber || row.mobile || "";
      
      // Skip empty rows
      if (!name && !rawPhone) {
        continue;
      }

      // Normalize phone number format
      const normalizedPhone = rawPhone.replace(/\D/g, "");
      const finalPhone = normalizedPhone.startsWith("+") ? normalizedPhone : `+${normalizedPhone}`;

      const contact = {
        name,
        email: row.email || null,
        phoneNumber: finalPhone,
        group: row.group || row.category || "General",
        userId: session.user.id
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
