import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { message, recipients } = await request.json();
    
    if (!message || !recipients || !recipients.length) {
      return NextResponse.json({ error: "Message and recipients are required" }, { status: 400 });
    }

    // Security: Limit recipients to 50 to prevent abuse
    if (recipients.length > 50) {
      return NextResponse.json({ error: "Maximum 50 recipients allowed per request" }, { status: 400 });
    }

    // Security: Limit message length to 1000 characters
    if (message.length > 1000) {
      return NextResponse.json({ error: "Message exceeds maximum length of 1000 characters" }, { status: 400 });
    }
    
    const results = [];
    
    // Send messages in batches to avoid rate limits
    for (const recipient of recipients) {
      try {
        const result = await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient.phoneNumber,
          // Ensure it's one way (though Twilio doesn't have a direct setting for this)
          provideFeedback: false
        });
        
        results.push({
          success: true,
          phoneNumber: recipient.phoneNumber,
          sid: result.sid
        });
        
        // Add a small delay between sends to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error("Twilio send error:", error);
        results.push({
          success: false,
          phoneNumber: recipient.phoneNumber,
          // Security: Do not leak specific Twilio error details to the client
          error: "Failed to send SMS"
        });
      }
    }
    
    // Log the message to the database
    await prisma.message.create({
      data: {
        content: message,
        sentBy: session.user?.email || "unknown",
        recipientCount: recipients.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length
      }
    });
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json({ error: "Failed to send messages" }, { status: 500 });
  }
}