"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createLabel, getLabels } from "./actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { Label as LabelType } from "@/lib/db/schema";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function LabelsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [labels, setLabels] = useState<LabelType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      const result = await getLabels();
      if ("error" in result) {
        setError(result.error || "Unknown error occurred");
      } else {
        setLabels(result.labels);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch labels");
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const definition = formData.get("definition") as string;

    try {
      const result = await createLabel({ title, definition });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Label created successfully");
        fetchLabels(); // Refresh the labels list
        setIsDialogOpen(false); // Close the dialog
        (event.target as HTMLFormElement).reset();
      }
    } catch {
      toast.error("Failed to create label");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto py-8 space-y-8">
      {error && (
        <div className="text-sm font-medium text-destructive">{error}</div>
      )}

      <div className="w-full mx-auto space-y-4">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Labels</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Label
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Label</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter label title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="definition">Definition</Label>
                  <Textarea
                    id="definition"
                    name="definition"
                    placeholder="Enter label definition"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Label"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable columns={columns} data={labels} />
      </div>
    </div>
  );
}
