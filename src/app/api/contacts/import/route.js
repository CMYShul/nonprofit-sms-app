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
    
    const { data } = parse(await file.text(), {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    if (data.length > 100) {
      return NextResponse.json({ error: "Import limit exceeded (max 100 contacts)" }, { status: 400 });
    }
    
    const contactsToCreate = data
      .map(row => ({
        name: (row.name || row.fullname || "").trim(),
        email: (row.email || "").trim() || null,
        phoneNumber: (row.phone || row.phonenumber || row.mobile || "").trim(),
        group: (row.group || row.category || "General").trim(),
        userId: session.user.id
      }))
      .filter(c => c.name && c.phoneNumber);
    
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
    return NextResponse.json({ error: "Failed to import contacts" }, { status: 500 });
  }
}
