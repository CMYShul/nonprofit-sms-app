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
    
    // Process and insert contacts
    const createdContacts = [];
    
    for (const row of data) {
      const name = (row.name || row.fullname || "").trim().slice(0, 100);
      const rawPhone = (row.phone || row.phonenumber || row.mobile || "").trim();
      const email = (row.email || "").trim().slice(0, 255);
      const group = (row.group || row.category || "General").trim().slice(0, 50);

      // Skip invalid rows
      if (!name || !rawPhone) continue;

      const digits = rawPhone.replace(/\D/g, "");
      if (!digits) continue;
      const phoneNumber = `+${digits}`.slice(0, 50);

      const createdContact = await prisma.contact.create({
        data: {
          name,
          phoneNumber,
          email: email || null,
          group: group || "General"
        }
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
