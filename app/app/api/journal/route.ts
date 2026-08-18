import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { journalSchema, journalQuerySchema } from "@/lib/validations";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const query = journalQuerySchema.parse({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });

    const where: {
      userId: string;
      date?: { gte?: string; lte?: string };
    } = { userId: user!.id };

    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = query.from;
      if (query.to) where.date.lte = query.to;
    }

    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { date: "desc" },
      take: query.from || query.to ? 365 : 90,
    });

    return jsonOk({ entries });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const data = journalSchema.parse(body);

    const entry = await prisma.journalEntry.upsert({
      where: {
        userId_date: {
          userId: user!.id,
          date: data.date,
        },
      },
      create: {
        userId: user!.id,
        date: data.date,
        wentWell: data.wentWell,
        stressedAbout: data.stressedAbout,
        tomorrowFocus: data.tomorrowFocus,
      },
      update: {
        wentWell: data.wentWell,
        stressedAbout: data.stressedAbout,
        tomorrowFocus: data.tomorrowFocus,
      },
    });

    return jsonOk({ entry });
  } catch (error) {
    return handleApiError(error);
  }
}
