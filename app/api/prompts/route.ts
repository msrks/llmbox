import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { llmPrompts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const prompts = await db
      .select()
      .from(llmPrompts)
      .orderBy(desc(llmPrompts.createdAt));
    return NextResponse.json({ prompts });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { promptTemplate } = json;

    if (!promptTemplate) {
      return NextResponse.json(
        { error: "Prompt template is required" },
        { status: 400 }
      );
    }

    const [newPrompt] = await db
      .insert(llmPrompts)
      .values({ promptTemplate })
      .returning();

    return NextResponse.json({ prompt: newPrompt });
  } catch {
    return NextResponse.json(
      { error: "Failed to create prompt" },
      { status: 500 }
    );
  }
}
