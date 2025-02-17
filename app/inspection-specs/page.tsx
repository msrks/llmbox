"use client";

import { useState, useEffect } from "react";
import type { Spec } from "@/lib/db/schema";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Plus, Wand2 } from "lucide-react";
import { TEMPLATE } from "./templates";
import { getSpecs, createSpec } from "./actions";

interface CreateSpecDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSpecCreated: () => void;
}

interface SpecFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  description: string;
  onDescriptionChange: (value: string) => void;
  onGenerateTemplate: () => void;
}

function SpecForm({
  onSubmit,
  isSubmitting,
  description,
  onDescriptionChange,
  onGenerateTemplate,
}: SpecFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <DialogTitle>New Inspection Specification</DialogTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGenerateTemplate}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Generate Template
          </Button>
        </div>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter specification description"
          rows={10}
          required
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="h-full resize-none"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Specification"}
        </Button>
      </div>
    </form>
  );
}

export function CreateSpecDialog({
  isOpen,
  onOpenChange,
  onSpecCreated,
}: CreateSpecDialogProps) {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createSpec(description);
      toast.success("Specification created successfully");
      setDescription("");
      onOpenChange(false);
      onSpecCreated();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create specification"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateTemplate = () => {
    setDescription(TEMPLATE);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] h-[90vh] max-h-[800px]">
        <SpecForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          description={description}
          onDescriptionChange={setDescription}
          onGenerateTemplate={handleGenerateTemplate}
        />
      </DialogContent>
    </Dialog>
  );
}

const SpecsClient = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [data, setData] = useState<Spec[]>([]);

  useEffect(() => {
    fetchSpecs();
  }, []);

  const fetchSpecs = async () => {
    try {
      const response = await getSpecs();
      setData(response.specs);
    } catch {
      toast.error("Failed to fetch specifications");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Inspection Specifications</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Specification
        </Button>
      </div>
      <DataTable columns={columns} data={data} />
      <CreateSpecDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSpecCreated={fetchSpecs}
      />
    </>
  );
};

export default function SpecsPage() {
  return <SpecsClient />;
}
