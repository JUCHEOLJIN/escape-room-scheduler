import { NextRequest, NextResponse } from "next/server";
import { getAllAvailability, setUserAvailability } from "@/lib/availability";

export async function GET() {
  try {
    const data = await getAllAvailability();
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/availability error:", err);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userName, dates } = (await req.json()) as {
      userName: string;
      dates: string[];
    };
    if (!userName || typeof userName !== "string") {
      return NextResponse.json({ error: "Invalid userName" }, { status: 400 });
    }
    await setUserAvailability(userName.trim(), dates ?? []);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/availability error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
