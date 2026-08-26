import { prisma } from "@/lib/db";
import { fail, ok, parseBody } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { startSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const { data, response } = await parseBody(request, loginSchema);
  if (response) return response;

  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
    select: { id: true, name: true, email: true, role: true, passwordHash: true },
  });

  // Same error either way, so the response can't be used to enumerate accounts.
  if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
    return fail("INVALID_CREDENTIALS", 401);
  }

  await startSession(user.id);
  const { passwordHash: _passwordHash, ...safe } = user;
  return ok({ user: safe });
}
