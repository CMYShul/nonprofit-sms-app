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
    
    // Security: Limit file size to 1MB to prevent DoS
    if (file && file.size > 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 1MB limit" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" }, 
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

    // Security: Limit number of rows to prevent resource exhaustion
    if (data.length > 100) {
      return NextResponse.json(
        { error: "Too many rows (limit: 100)" },
        { status: 400 }
      );
    }
    
    // Process and insert contacts
    const createdContacts = [];
    
    for (const row of data) {
      // Map CSV fields to your contact model
      const name = (row.name || row.fullname || "").substring(0, 100);
      const email = (row.email || "").substring(0, 255);
      const rawPhone = row.phone || row.phonenumber || row.mobile || "";
      const group = (row.group || row.category || "General").substring(0, 50);

      // Skip empty rows
      if (!name && !rawPhone) {
        continue;
      }

      // Normalize phone number format (E.164-like)
      const digitsOnly = rawPhone.replace(/\D/g, "");
      if (!digitsOnly) continue;

      const contactData = {
        name,
        email: email || null,
        phoneNumber: `+${digitsOnly}`,
        group: group
      };
      
      // Create contact in database
      const createdContact = await prisma.contact.create({
        data: contactData
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
