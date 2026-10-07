import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { BILLING_SKUS, type BillingSku } from "@alavo/brand";
import { audit, requireAdmin } from "@/lib/admin";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { enforceRateLimit } from "@/lib/with-rate-limit";
import { prisma } from "@/lib/prisma";
import { applyPaidSku } from "@/lib/billing/apply-purchase";
import { isSku } from "@/lib/billing/entitlements";
import { trialWindow } from "@/lib/billing/entitlements";
import { shouldStartLegacyTrial } from "@/lib/billing/cloud-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEntitlementSnapshot } from "@/lib/billing/access";

const PAGE_SIZE = 25;

const createUserSchema = z.object({
  email: z.string().email().max(160),
  grantSku: z
    .enum(BILLING_SKUS as unknown as [BillingSku, ...BillingSku[]])
    .optional()
    .nullable(),
});

function serializeUser(
  user: {
    id: string;
    email: string;
    emailVerified: Date | null;
    plan: string;
    planExpiresAt: Date | null;
    lifetime: boolean;
    trialEndsAt: Date | null;
    createdAt: Date;
    _count: { habits: number; payments: number };
    addons: { sku: string }[];
  },
  billing: Awaited<ReturnType<typeof getEntitlementSnapshot>>
) {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    plan: user.plan,
    planExpiresAt: user.planExpiresAt,
    lifetime: user.lifetime,
    trialEndsAt: user.trialEndsAt,
    habitCount: user._count.habits,
    paymentCount: user._count.payments,
    addons: user.addons.map((addon) => addon.sku),
    billing,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim().toLowerCase();
    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

    const where = q
      ? { email: { contains: q, mode: "insensitive" as const } }
      : {};

    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          email: true,
          emailVerified: true,
          plan: true,
          planExpiresAt: true,
          lifetime: true,
          trialEndsAt: true,
          createdAt: true,
          addons: { select: { sku: true } },
          _count: { select: { habits: true, payments: true } },
        },
      }),
    ]);

    const users = await Promise.all(
      rows.map(async (user) =>
        serializeUser(user, await getEntitlementSnapshot(user.id))
      )
    );

    return jsonOk({
      users,
      page,
      pageSize: PAGE_SIZE,
      total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, "admin:users", 20, 60_000);
    if (limited) return limited;

    const { user: admin, error } = await requireAdmin(req);
    if (error) return error;

    const body = createUserSchema.parse(await req.json());
    const email = body.email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("That email already has an account. Grant a plan instead.", 409);
    }

    const password = randomBytes(12).toString("base64url");
    const supabase = createAdminClient();
    const created = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (created.error || !created.data.user) {
      return jsonError(created.error?.message || "Could not create auth user", 400);
    }

    const dbUser = await prisma.user.upsert({
      where: { email },
      update: { emailVerified: new Date() },
      create: {
        id: created.data.user.id,
        email,
        emailVerified: new Date(),
        passwordHash: null,
        provider: "EMAIL",
        ...(shouldStartLegacyTrial(new Date()) ? trialWindow() : {}),
      },
    });

    if (body.grantSku && isSku(body.grantSku)) {
      await applyPaidSku(dbUser.id, body.grantSku);
    }

    await audit({
      actorEmail: admin!.email,
      action: "user.create",
      targetEmail: email,
      detail: { grantSku: body.grantSku ?? null },
    });

    return jsonOk(
      {
        user: serializeUser(
          {
            ...dbUser,
            addons: [],
            _count: { habits: 0, payments: 0 },
          },
          await getEntitlementSnapshot(dbUser.id)
        ),
        temporaryPassword: password,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
