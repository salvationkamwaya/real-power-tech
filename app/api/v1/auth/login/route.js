import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Operator from "@/models/Operator";

// Simple cookie session for prototype Phase 2; later replace with proper session lib if needed
const COOKIE_NAME = "rpt_session";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};
    if (!email || !password) {
      return NextResponse.json(
        {
          status: 400,
          error: "Bad Request",
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    await dbConnect();
    const op = await Operator.findOne({ email }).lean(false);
    if (!op) {
      return NextResponse.json(
        { status: 401, error: "Unauthorized", message: "Invalid credentials" },
        { status: 401 }
      );
    }
    const ok = await op.comparePassword(password);
    if (!ok) {
      return NextResponse.json(
        { status: 401, error: "Unauthorized", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const res = NextResponse.json(
      { user: { id: op._id.toString(), email: op.email } },
      { status: 200 }
    );
    // For MVP: unsigned simple cookie; in production use encrypted/signed cookie
    res.cookies.set({
      name: COOKIE_NAME,
      value: JSON.stringify({ uid: op._id.toString() }),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return res;
  } catch (err) {
    console.error("/auth/login error", err);
    return NextResponse.json(
      {
        status: 500,
        error: "Internal Server Error",
        message: "Unexpected error",
      },
      { status: 500 }
    );
  }
}
