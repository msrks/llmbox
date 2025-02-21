"use client";

import { useState, useEffect } from "react";
import type { InspectionSpec } from "@/lib/db/schema";
import { columns, InspectionSpecWithActions } from "./columns";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Plus, Wand2 } from "lucide-react";
import { TEMPLATE } from "./templates";
import { getSpecs, createSpec, updateSpec, deleteSpec } from "./actions";
import { PageTitle } from "@/components/page-title";
import { useParams } from "next/navigation";
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
  text: string;
  onTextChange: (value: string) => void;
  onGenerateTemplate: () => void;
}

function SpecForm({
  onSubmit,
  isSubmitting,
  text,
  onTextChange,
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
          id="text"
          name="text"
          placeholder="Enter specification text"
          rows={10}
          required
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
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
  const params = useParams();
  const projectId = params.projectId as string;
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createSpec(projectId, text);
      toast.success("Specification created successfully");
      setText("");
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
    setText(TEMPLATE);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] h-[90vh] max-h-[800px]">
        <SpecForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          text={text}
          onTextChange={setText}
          onGenerateTemplate={handleGenerateTemplate}
        />
      </DialogContent>
    </Dialog>
  );
}

interface EditSpecDialogProps {
  spec: InspectionSpec | null;
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
  const params = useParams();
  const projectId = params.projectId as string;
  const [text, setText] = useState(spec?.text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (spec) {
      setText(spec.text);
    }
  }, [spec]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (!spec) return;
      await updateSpec(projectId, spec.id, text);
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
              value={text}
              onChange={(e) => setText(e.target.value)}
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
  const params = useParams();
  const projectId = params.projectId as string;
  const [specs, setSpecs] = useState<InspectionSpecWithActions[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState<InspectionSpec | null>(null);

  useEffect(() => {
    fetchSpecs();
  }, []);

  const fetchSpecs = async () => {
    try {
      const response = await getSpecs(projectId);
      const specsWithActions = response.specs.map((spec) => ({
        ...spec,
        onEdit: handleEdit,
        onDelete: handleDelete,
      }));
      setSpecs(specsWithActions);
    } catch {
      toast.error("Failed to fetch specifications");
    }
  };

  const handleEdit = (spec: InspectionSpec) => {
    setSelectedSpec(spec);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (spec: InspectionSpec) => {
    setSelectedSpec(spec);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSpec) return;

    try {
      await deleteSpec(projectId, selectedSpec.id);
      toast.success("Specification deleted successfully");
      fetchSpecs();
    } catch {
      toast.error("Failed to delete specification");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedSpec(null);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Inspection Specifications</PageTitle>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Specification
        </Button>
      </div>

      <DataTable columns={columns} data={specs} />

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
            <AlertDialogAction onClick={handleDeleteConfirm}>
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
