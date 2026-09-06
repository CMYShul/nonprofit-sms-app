import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parse } from "papaparse";
import prisma from "@/lib/prisma";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_ROWS = 100;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 1MB limit" }, { status: 400 });
    }
    
    const csvText = await file.text();
    
    const { data } = parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "CSV file is empty or invalid" }, { status: 400 });
    }

    if (data.length > MAX_ROWS) {
      return NextResponse.json({ error: `Cannot import more than ${MAX_ROWS} contacts at once` }, { status: 400 });
    }
    
    const contactsToCreate = [];
    
    for (const row of data) {
      const rawName = (row.name || row.fullname || "").trim();
      const rawEmail = (row.email || "").trim();
      const rawPhone = (row.phone || row.phonenumber || row.mobile || "").trim();
      const rawGroup = (row.group || row.category || "General").trim();

      if (!rawName && !rawPhone) {
        continue;
      }

      const digitsOnly = rawPhone.replace(/\D/g, "");
      const normalizedPhone = rawPhone.startsWith("+") ? rawPhone.slice(0, 50) : `+${digitsOnly}`.slice(0, 50);

      contactsToCreate.push({
        name: rawName.slice(0, 100),
        email: rawEmail ? rawEmail.slice(0, 255) : null,
        phoneNumber: normalizedPhone,
        group: rawGroup ? rawGroup.slice(0, 50) : "General",
      });
    }

    if (contactsToCreate.length > 0) {
      await prisma.contact.createMany({
        data: contactsToCreate,
      });
    }
    
    return NextResponse.json({
      message: `Successfully imported ${contactsToCreate.length} contacts`,
      count: contactsToCreate.length
    });
    
  } catch (error) {
    console.error("Error importing contacts:", error);
    return NextResponse.json(
      { error: "Failed to import contacts" }, 
      { status: 500 }
    );
  }
}
