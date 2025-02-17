import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { specs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allSpecs = await db
      .select()
      .from(specs)
      .orderBy(desc(specs.createdAt));
    return NextResponse.json({ specs: allSpecs });
  } catch (error) {
    console.error("Failed to fetch specs:", error);
    return NextResponse.json(
      { error: "Failed to fetch specifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { description } = json;

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const newSpec = await db
      .insert(specs)
      .values({
        description,
      })
      .returning();

    return NextResponse.json({ spec: newSpec[0] });
  } catch (error) {
    console.error("Failed to create spec:", error);
    return NextResponse.json(
      { error: "Failed to create specification" },
      { status: 500 }
    );
  }
}
