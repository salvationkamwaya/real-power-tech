// Deprecated legacy session route removed. Use /api/auth/session from NextAuth.
export function GET() {
  return new Response("Not Found", { status: 404 });
}
