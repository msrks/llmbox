"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCriteria, getCriterias } from "./actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { Criteria } from "@/lib/db/schema";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";

export default function CriteriasPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [criterias, setCriterias] = useState<Criteria[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCriterias();
  }, []);

  const fetchCriterias = async () => {
    try {
      const result = await getCriterias();
      if ("error" in result) {
        setError(result.error || "Unknown error occurred");
      } else {
        setCriterias(result.criterias);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch criterias"
      );
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    try {
      const result = await createCriteria({ name, description });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Criteria created successfully");
        fetchCriterias(); // Refresh the criterias list
        setIsDialogOpen(false); // Close the dialog
        (event.target as HTMLFormElement).reset();
      }
    } catch {
      toast.error("Failed to create criteria");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto space-y-8">
      {error && (
        <div className="text-sm font-medium text-destructive">{error}</div>
      )}

      <div className="w-full mx-auto space-y-4">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Criterias</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Criteria
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Criteria</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter criteria name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter criteria description"
                      className="resize-none min-h-[120px]"
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Criteria"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <DataTable columns={columns} data={criterias} />
      </div>
    </div>
  );
}
