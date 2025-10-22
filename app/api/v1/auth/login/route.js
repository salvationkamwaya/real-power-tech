// Deprecated legacy auth route removed. Using NextAuth at /api/auth/[...nextauth]
export function GET() {
  return new Response("Not Found", { status: 404 });
}

export function POST() {
  return new Response("Not Found", { status: 404 });
}
