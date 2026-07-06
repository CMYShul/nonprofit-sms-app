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

    // Limit file size to 1MB
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

    // Limit the number of rows to process
    if (data.length > 100) {
      return NextResponse.json(
        { error: "Too many rows (limit: 100 contacts per import)" },
        { status: 400 }
      );
    }
    
    // Process and insert contacts
    const contactsToCreate = [];
    
    for (const row of data) {
      // Map CSV fields to your contact model
      // Adjust field names based on your CSV structure
      const rawName = (row.name || row.fullname || "").trim();
      const rawPhone = (row.phone || row.phonenumber || row.mobile || "").trim();
      const rawEmail = (row.email || "").trim();
      const rawGroup = (row.group || row.category || "General").trim();

      // Skip empty rows
      if (!rawName && !rawPhone) {
        continue;
      }

      // Normalize phone number format
      const hasPlus = rawPhone.startsWith("+");
      const digitsOnly = rawPhone.replace(/\D/g, "");
      const finalPhone = digitsOnly ? (hasPlus ? `+${digitsOnly}` : `+${digitsOnly}`) : "";

      contactsToCreate.push({
        name: rawName.slice(0, 100),
        email: rawEmail ? rawEmail.slice(0, 255) : null,
        phoneNumber: finalPhone.slice(0, 50),
        group: rawGroup.slice(0, 50)
      });
    }

    if (contactsToCreate.length === 0) {
      return NextResponse.json(
        { error: "No valid contacts found in CSV" },
        { status: 400 }
      );
    }

    // Bulk create contacts for efficiency and to reduce database load
    const { count } = await prisma.contact.createMany({
      data: contactsToCreate
    });
    
    return NextResponse.json({
      message: `Successfully imported ${count} contacts`,
      count
    });
    
  } catch (error) {
    console.error("Error importing contacts:", error);
    return NextResponse.json(
      { error: "Failed to import contacts" }, 
      { status: 500 }
    );
  }
}
