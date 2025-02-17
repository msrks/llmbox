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
import { getSpecs, createSpec, updateSpec, deleteSpec } from "./actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface EditSpecDialogProps {
  spec: Spec | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSpecUpdated: () => void;
}

export function EditSpecDialog({
  spec,
  isOpen,
  onOpenChange,
  onSpecUpdated,
}: EditSpecDialogProps) {
  const [description, setDescription] = useState(spec?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (spec) {
      setDescription(spec.description);
    }
  }, [spec]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (!spec) return;
      await updateSpec(spec.id, description);
      toast.success("Specification updated successfully");
      onOpenChange(false);
      onSpecUpdated();
    } catch {
      toast.error("Failed to update specification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <DialogTitle>Edit Inspection Specification</DialogTitle>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter specification..."
              className="h-[200px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const SpecsClient = () => {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState<Spec | null>(null);

  useEffect(() => {
    fetchSpecs();
  }, []);

  const fetchSpecs = async () => {
    try {
      const response = await getSpecs();
      setSpecs(response.specs);
    } catch {
      toast.error("Failed to fetch specifications");
    }
  };

  const handleEdit = (spec: Spec) => {
    setSelectedSpec(spec);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (spec: Spec) => {
    setSelectedSpec(spec);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSpec) return;

    try {
      await deleteSpec(selectedSpec.id);
      toast.success("Specification deleted successfully");
      fetchSpecs();
    } catch {
      toast.error("Failed to delete specification");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedSpec(null);
    }
  };

  const columnsWithCallbacks = columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }) => {
          const spec = row.original;
          return col.cell?.({
            row: {
              ...row,
              original: { ...spec, onEdit: handleEdit, onDelete: handleDelete },
            },
          });
        },
      };
    }
    return col;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Inspection Specifications</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Specification
        </Button>
      </div>

      <DataTable columns={columnsWithCallbacks} data={specs} />

      <CreateSpecDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSpecCreated={fetchSpecs}
      />

      <EditSpecDialog
        spec={selectedSpec}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSpecUpdated={fetchSpecs}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              specification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default function SpecsPage() {
  return <SpecsClient />;
}
