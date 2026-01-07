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

    // Get notifications for the user
    const [notifications] = await connection.execute(
      `
      SELECT
        id,
        type,
        title,
        message,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
      `,
      [userId]
    );

    // Format the notifications
    const formattedNotifications = (notifications as any[]).map((notif) => ({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      isRead: notif.is_read,
      createdAt: notif.created_at,
      // Map notification types to icons
      icon: getNotificationIcon(notif.type),
      bgColor: getNotificationBgColor(notif.type),
    }));

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const connection = await db();

    await connection.execute(
      `
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (?, ?, ?, ?)
      `,
      [userId, type, title, message]
    );

    return NextResponse.json({
      success: true,
      message: "Notification created successfully",
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions for notification styling
function getNotificationIcon(type: string): string {
  switch (type.toLowerCase()) {
    case "error":
      return "mdi-alert-circle";
    case "warning":
      return "mdi-alert";
    case "info":
      return "mdi-information";
    case "success":
      return "mdi-check-circle";
    case "user":
      return "mdi-account-box";
    case "system":
      return "mdi-cog";
    default:
      return "mdi-bell";
  }
}

function getNotificationBgColor(type: string): string {
  switch (type.toLowerCase()) {
    case "error":
      return "bg-danger";
    case "warning":
      return "bg-warning";
    case "info":
      return "bg-info";
    case "success":
      return "bg-success";
    case "user":
      return "bg-primary";
    case "system":
      return "bg-secondary";
    default:
      return "bg-primary";
  }
}