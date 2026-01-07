import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const connection = await db();

    // Get messages for the user (received messages)
    const [messages] = await connection.execute(
      `
      SELECT
        m.id,
        m.subject,
        m.content,
        m.is_read,
        m.created_at,
        u.username as sender_name,
        u.url_photo as sender_photo
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.receiver_id = ?
      ORDER BY m.created_at DESC
      LIMIT 10
      `,
      [userId]
    );

    // Format the messages
    const formattedMessages = (messages as any[]).map((msg) => ({
      id: msg.id,
      sender: {
        name: msg.sender_name,
        photo: msg.sender_photo || "/images/faces/face5.jpg",
      },
      subject: msg.subject,
      content: msg.content,
      isRead: msg.is_read,
      createdAt: msg.created_at,
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, receiverId, subject, content } = body;

    if (!senderId || !receiverId || !subject || !content) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const connection = await db();

    await connection.execute(
      `
      INSERT INTO messages (sender_id, receiver_id, subject, content)
      VALUES (?, ?, ?, ?)
      `,
      [senderId, receiverId, subject, content]
    );

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}