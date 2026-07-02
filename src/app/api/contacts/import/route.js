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

    // SECURITY: Limit file size to 1MB to prevent DoS
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (limit: 1MB)" },
        { status: 413 }
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

    // SECURITY: Limit number of rows to 100 to prevent resource exhaustion
    const rowsToProcess = data.slice(0, 100);
    
    // Process and insert contacts
    const contactsToCreate = [];
    
    for (const row of rowsToProcess) {
      // Map CSV fields to your contact model and normalize/truncate
      const name = (row.name || row.fullname || "").substring(0, 100);
      const email = (row.email || "").substring(0, 255);
      const rawPhone = (row.phone || row.phonenumber || row.mobile || "");
      const group = (row.group || row.category || "General").substring(0, 50);

      // Normalize phone number
      const digitsOnly = rawPhone.replace(/\D/g, "");
      const phoneNumber = digitsOnly ? `+${digitsOnly}`.substring(0, 50) : "";

      // Skip empty rows
      if (!name && !phoneNumber) {
        continue;
      }

      contactsToCreate.push({
        name,
        email: email || null,
        phoneNumber,
        group: group || "General"
      });
    }

    if (contactsToCreate.length === 0) {
      return NextResponse.json(
        { error: "No valid contacts found in CSV" },
        { status: 400 }
      );
    }

    // Create contacts in database in bulk
    const { count } = await prisma.contact.createMany({
      data: contactsToCreate,
      skipDuplicates: true // Optional: skip if database has unique constraints (not in schema yet but good practice)
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
