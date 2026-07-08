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

    // Security: Limit file size (1MB) and row count (100) to prevent DoS
    if (file.size > 1024 * 1024) return NextResponse.json({ error: "File too large" }, { status: 400 });

    const { data } = parse(await file.text(), {
      header: true, skipEmptyLines: true, transformHeader: (h) => h.trim().toLowerCase(),
    });

    if (!data?.length || data.length > 100) {
      return NextResponse.json({ error: !data?.length ? "CSV empty" : "Too many rows" }, { status: 400 });
    }

    const contactsToCreate = data.map(row => {
      const name = (row.name || row.fullname || "").substring(0, 100);
      const phone = (row.phone || row.phonenumber || row.mobile || "").replace(/\D/g, "").substring(0, 50);
      if (!name && !phone) return null;
      return {
        name,
        email: (row.email || "").substring(0, 255),
        phoneNumber: phone ? `+${phone}` : "",
        group: (row.group || row.category || "General").substring(0, 50)
      };
    }).filter(Boolean);

    if (contactsToCreate.length === 0) return NextResponse.json({ error: "No valid contacts" }, { status: 400 });

    // Security: Use createMany for optimized bulk insertion
    const result = await prisma.contact.createMany({ data: contactsToCreate });

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
