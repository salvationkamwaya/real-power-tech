import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function requireAdminSession(_req) {
  // In App Router route handlers, getServerSession uses authOptions only.
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session;
}
