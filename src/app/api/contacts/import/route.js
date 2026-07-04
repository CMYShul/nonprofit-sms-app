import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parse } from "papaparse";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    
    if (file.size > 1024 * 1024) return NextResponse.json({ error: "File too large (limit: 1MB)" }, { status: 400 });

    const csvText = await file.text();
    const { data } = parse(csvText, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim().toLowerCase() });
    
    if (!data || data.length === 0) return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    if (data.length > 100) return NextResponse.json({ error: "Too many rows (limit: 100)" }, { status: 400 });

    const contactsToCreate = data.map(row => {
      const name = (row.name || row.fullname || "").toString().slice(0, 100);
      const rawPhone = (row.phone || row.phonenumber || row.mobile || "").toString().replace(/\D/g, "");
      if (!name && !rawPhone) return null;
      // NOTE: Contact model currently lacks a userId field in prisma/schema.prisma.
      // Data ownership should be implemented at the schema level once the field is added.
      return {
        name: name || "Unknown",
        email: (row.email || "").toString().slice(0, 255),
        phoneNumber: `+${rawPhone}`.slice(0, 50),
        group: (row.group || row.category || "General").toString().slice(0, 50)
      };
    }).filter(Boolean);

    if (contactsToCreate.length === 0) return NextResponse.json({ error: "No valid contacts found" }, { status: 400 });

    const result = await prisma.contact.createMany({ data: contactsToCreate });
    
    return NextResponse.json({ message: `Successfully imported ${result.count} contacts`, count: result.count });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import contacts" }, { status: 500 });
  }
}
