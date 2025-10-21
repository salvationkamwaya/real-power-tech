import { NextResponse } from "next/server";

const COOKIE_NAME = "rpt_session";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out successfully." });
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
