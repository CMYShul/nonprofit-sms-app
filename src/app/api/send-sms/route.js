import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { message, recipients } = await request.json();
    
    if (!message || !recipients || !recipients.length) {
      return NextResponse.json({ error: "Message and recipients are required" }, { status: 400 });
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
        results.push({
          success: false,
          phoneNumber: recipient.phoneNumber,
          error: error.message
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