import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parse } from "papaparse";
import prisma from "@/lib/prisma";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB limit
const MAX_ROWS = 100;

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get form data with the CSV file
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 1MB)" }, { status: 400 });
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
      return NextResponse.json({ error: "CSV file is empty or invalid" }, { status: 400 });
    }

    if (data.length > MAX_ROWS) {
      return NextResponse.json({ error: `Too many rows (max ${MAX_ROWS})` }, { status: 400 });
    }
    
    // Process and insert contacts
    const contactsToCreate = [];
    
    for (const row of data) {
      const name = (row.name || row.fullname || "").substring(0, 100);
      const email = (row.email || "").substring(0, 255);
      let phone = row.phone || row.phonenumber || row.mobile || "";
      const group = (row.group || row.category || "General").substring(0, 50);
      
      if (!name && !phone) continue;

      // Normalize and truncate phone number
      const digitsOnly = phone.replace(/\D/g, "");
      const formattedPhone = `+${digitsOnly}`.substring(0, 50);
      
      contactsToCreate.push({
        name,
        email: email || null,
        phoneNumber: formattedPhone,
        group
      });
    }
    
    const { count } = await prisma.contact.createMany({
      data: contactsToCreate,
      skipDuplicates: true
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
