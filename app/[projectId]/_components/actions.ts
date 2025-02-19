"use server";

import { getProjects } from "@/lib/db/queries/projects";

export async function getProjectsAction() {
  return getProjects();
}
