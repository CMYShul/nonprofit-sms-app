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

    // Limit file size to 1MB to prevent memory exhaustion / DoS
    if (file.size > 1024 * 1024) {
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

    // Limit imported rows to prevent DoS / resource exhaustion
    if (data.length > 100) {
      return NextResponse.json(
        { error: "Import limit exceeded (max 100 contacts)" },
        { status: 400 }
      );
    }
    
    // Process and insert contacts
    const createdContacts = [];
    
    for (const row of data) {
      const rawName = (row.name || row.fullname || "").trim();
      const rawPhone = (row.phone || row.phonenumber || row.mobile || "").trim();
      
      // Skip empty rows
      if (!rawName && !rawPhone) {
        continue;
      }

      const digits = rawPhone.replace(/\D/g, "");
      const formattedPhone = digits ? `+${digits}`.slice(0, 50) : "";

      // Truncate fields to prevent memory bloat or database errors
      const contact = {
        name: rawName.slice(0, 100),
        email: (row.email || "").trim().slice(0, 255) || null,
        phoneNumber: formattedPhone,
        group: (row.group || row.category || "General").trim().slice(0, 50)
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
