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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/specs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Specification created successfully");
        onSpecCreated();
        onOpenChange(false);
        setDescription("");
      }
    } catch {
      toast.error("Failed to create specification");
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

const SpecsClient = ({
  onSpecCreated,
}: {
  onSpecCreated: () => Promise<void>;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Specification
      </Button>
      <CreateSpecDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSpecCreated={onSpecCreated}
      />
    </>
  );
};

export default function SpecsPage() {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpecs();
  }, []);

  const fetchSpecs = async () => {
    try {
      const response = await fetch("/api/specs");
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSpecs(data.specs);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch specifications"
      );
    }
  };

  return (
    <div className="mx-auto py-8 space-y-8">
      {error && (
        <div className="text-sm font-medium text-destructive">{error}</div>
      )}

      <div className="w-full mx-auto space-y-4">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Inspection Specifications
          </h2>
          <SpecsClient onSpecCreated={fetchSpecs} />
        </div>
        <DataTable columns={columns} data={specs} />
      </div>
    </div>
  );
}
