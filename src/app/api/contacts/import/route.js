import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parse } from "papaparse";
import prisma from "@/lib/prisma";

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

    // Limit file size to 1MB to prevent Denial-of-Service / resource exhaustion
    if (file.size > 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 1MB limit" }, { status: 400 });
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

    // Limit import rows to 100 contacts to prevent resource exhaustion
    if (data.length > 100) {
      return NextResponse.json({ error: "Import limit exceeded (max 100 contacts)" }, { status: 400 });
    }
    
    const contactsToCreate = [];
    
    for (const row of data) {
      const rawName = (row.name || row.fullname || "").trim().slice(0, 100);
      const rawPhone = (row.phone || row.phonenumber || row.mobile || "").trim();
      const rawEmail = (row.email || "").trim().slice(0, 255);
      const rawGroup = (row.group || row.category || "General").trim().slice(0, 50);

      if (!rawName && !rawPhone) continue;

      const digits = rawPhone.replace(/\D/g, "");
      const normalizedPhone = digits ? `+${digits}`.slice(0, 50) : "";

      contactsToCreate.push({
        name: rawName,
        phoneNumber: normalizedPhone,
        email: rawEmail || null,
        group: rawGroup || "General"
      });
    }

    if (contactsToCreate.length === 0) {
      return NextResponse.json({ error: "No valid contacts found in CSV" }, { status: 400 });
    }

    const result = await prisma.contact.createMany({
      data: contactsToCreate
    });
    
    return NextResponse.json({
      message: `Successfully imported ${result.count} contacts`,
      count: result.count
    });
  } catch (error) {
    console.error("Error importing contacts:", error);
    return NextResponse.json({ error: "Failed to import contacts" }, { status: 500 });
  }
}
