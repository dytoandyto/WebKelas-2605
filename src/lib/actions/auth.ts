"use server";

import { redirect } from "next/navigation";
import { loginSchema, LoginInput } from "@/lib/validations";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db";
import { initialUsers } from "@/lib/data/initial-data";

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const validation = loginSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid email or password",
    };
  }

  const { email, password } = validation.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Check fallback initial users for local demo resilience
      const fallbackUser = initialUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (fallbackUser) {
        // Fallback demo credentials check
        const validDemoPasswords: Record<string, string> = {
          "admin@classhub.edu": "AdminClassHub2026!",
          "classadmin@classhub.edu": "ClassAdmin2026!",
          "lecturer@classhub.edu": "Lecturer2026!",
          "assistant@classhub.edu": "Assistant2026!",
        };
        if (validDemoPasswords[fallbackUser.email] === password) {
          await createSession({
            id: fallbackUser.id,
            email: fallbackUser.email,
            name: fallbackUser.name,
            role: fallbackUser.role,
          });
          return { success: true };
        }
      }

      return { success: false, error: "Invalid email or password" };
    }

    if (!user.isActive) {
      return { success: false, error: "Account has been deactivated. Please contact an administrator." };
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" };
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return { success: true };
  } catch (err) {
    console.error("Login action error:", err);
    // Fallback demo check if database is temporarily offline
    const fallbackUser = initialUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (fallbackUser) {
      const validDemoPasswords: Record<string, string> = {
        "admin@classhub.edu": "AdminClassHub2026!",
        "classadmin@classhub.edu": "ClassAdmin2026!",
        "lecturer@classhub.edu": "Lecturer2026!",
        "assistant@classhub.edu": "Assistant2026!",
      };
      if (validDemoPasswords[fallbackUser.email] === password) {
        await createSession({
          id: fallbackUser.id,
          email: fallbackUser.email,
          name: fallbackUser.name,
          role: fallbackUser.role,
        });
        return { success: true };
      }
    }

    return { success: false, error: "Invalid email or password" };
  }
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
