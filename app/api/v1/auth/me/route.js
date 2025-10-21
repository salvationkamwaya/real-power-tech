import { NextResponse } from "next/server";

const COOKIE_NAME = "rpt_session";

export async function GET(request) {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie)
    return NextResponse.json(
      { status: 401, error: "Unauthorized" },
      { status: 401 }
    );
  try {
    const session = JSON.parse(cookie);
    return NextResponse.json({ user: { id: session.uid } }, { status: 200 });
  } catch (_e) {
    return NextResponse.json(
      { status: 401, error: "Unauthorized" },
      { status: 401 }
    );
  }
}
