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

    // Limit file size to 1MB to prevent DoS
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

    // Limit imported rows to 100 to prevent DoS/resource exhaustion
    if (data.length > 100) {
      return NextResponse.json(
        { error: "Import limit exceeded (max 100 rows)" },
        { status: 400 }
      );
    }
    
    // Process and sanitize contacts
    const contactsToCreate = [];
    
    for (const row of data) {
      const name = (row.name || row.fullname || "").trim().slice(0, 100);
      const rawPhone = (row.phone || row.phonenumber || row.mobile || "").replace(/\D/g, "").slice(0, 50);
      const email = (row.email || "").trim().slice(0, 255);
      const group = (row.group || row.category || "General").trim().slice(0, 50);

      // Skip empty rows
      if (!name && !rawPhone) {
        continue;
      }

      contactsToCreate.push({
        name,
        phoneNumber: rawPhone ? `+${rawPhone}` : "",
        email: email || null,
        group: group || "Default"
      });
    }

    if (contactsToCreate.length === 0) {
      return NextResponse.json(
        { error: "No valid contacts found in CSV" },
        { status: 400 }
      );
    }

    // Bulk insert contacts for performance and resource safety
    const result = await prisma.contact.createMany({
      data: contactsToCreate
    });
    
    return NextResponse.json({
      message: `Successfully imported ${result.count} contacts`,
      count: result.count
    });
    
  } catch (error) {
    console.error("Error importing contacts:", error);
    return NextResponse.json(
      { error: "Failed to import contacts" }, 
      { status: 500 }
    );
  }
}
