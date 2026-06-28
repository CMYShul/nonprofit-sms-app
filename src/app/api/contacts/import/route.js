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
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (file.size > 1024 * 1024) return NextResponse.json({ error: "File too large (1MB limit)" }, { status: 400 });
    
    const { data } = parse(await file.text(), {
      header: true, skipEmptyLines: true, transformHeader: (h) => h.trim().toLowerCase(),
    });
    
    if (!data || data.length === 0) return NextResponse.json({ error: "CSV is empty" }, { status: 400 });
    if (data.length > 100) return NextResponse.json({ error: "Too many rows (100 limit)" }, { status: 400 });
    
    const createdContacts = [];
    for (const row of data) {
      const contactData = {
        name: (row.name || row.fullname || "").substring(0, 100),
        email: (row.email || "").substring(0, 255),
        phoneNumber: `+${(row.phone || row.phonenumber || row.mobile || "").replace(/\D/g, "")}`.substring(0, 50),
        group: (row.group || row.category || "General").substring(0, 50)
      };
      
      if (!contactData.name && contactData.phoneNumber === "+") continue;
      
      createdContacts.push(await prisma.contact.create({ data: contactData }));
    }
    
    return NextResponse.json({ message: `Imported ${createdContacts.length} contacts`, count: createdContacts.length });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import contacts" }, { status: 500 });
  }
}
