"use server";

import { createProject } from "./project";

export async function handleNewProject(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { error: "Name is required" };
  }

  try {
    await createProject({ name, description });
    return { success: true };
  } catch {
    return { error: "Failed to create project" };
  }
}
