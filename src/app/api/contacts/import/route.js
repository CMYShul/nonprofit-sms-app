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

    if (data.length > 100) {
      return NextResponse.json(
        { error: "Import limit exceeded. Maximum 100 contacts per import allowed." },
        { status: 400 }
      );
    }
    
    // Process and insert contacts
    const contactsToCreate = data.map(row => ({
      name: row.name || row.fullname || "",
      email: row.email || "",
      phoneNumber: String(row.phone || row.phonenumber || row.mobile || ""),
      group: row.group || row.category || "General",
      userId: session.user.id
    })).filter(c => c.name || c.phoneNumber);
    
    if (contactsToCreate.length === 0) {
      return NextResponse.json({ message: "No valid contacts found in CSV", count: 0 });
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
