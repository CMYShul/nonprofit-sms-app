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

    // Limit file size to 1MB to prevent DoS attacks
    if (file.size > 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds limit (1MB)" },
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

    // Limit max contacts per import to 100 to prevent DoS and resource exhaustion
    if (data.length > 100) {
      return NextResponse.json(
        { error: "Exceeded maximum limit of 100 contacts per import" },
        { status: 400 }
      );
    }
    
    // Process and insert contacts
    const createdContacts = [];
    
    for (const row of data) {
      // Input sanitization and length limits
      const name = (row.name || row.fullname || "").slice(0, 100);
      const email = (row.email || "").slice(0, 255);
      const rawPhone = row.phone || row.phonenumber || row.mobile || "";
      const digitsOnly = rawPhone.replace(/\D/g, "").slice(0, 50);
      const group = (row.group || row.category || "General").slice(0, 50);
      
      // Skip rows missing required name or phone number
      if (!name || !digitsOnly) {
        continue;
      }

      const normalizedPhone = `+${digitsOnly}`;

      // Note: userId is omitted because Contact model in prisma/schema.prisma does not have a userId field
      const contact = {
        name,
        email: email || null,
        phoneNumber: normalizedPhone,
        group
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
