"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { Criteria } from "@/lib/db/schema";

interface AddCriteriaExampleDialogProps {
  fileId: number;
  fileName: string;
  criterias: Criteria[];
  onSubmit: (data: {
    fileId: number;
    criteriaId: number;
    isPositive: boolean;
    reason: string;
  }) => Promise<void>;
}

export function AddCriteriaExampleDialog({
  fileId,
  fileName,
  criterias,
  onSubmit,
}: AddCriteriaExampleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [criteriaId, setCriteriaId] = useState<string>();
  const [isPositive, setIsPositive] = useState<string>();
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!criteriaId || !isPositive || !reason.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        fileId,
        criteriaId: parseInt(criteriaId),
        isPositive: isPositive === "positive",
        reason: reason.trim(),
      });
      toast.success("Example added successfully");
      setOpen(false);
      // Reset form
      setCriteriaId(undefined);
      setIsPositive(undefined);
      setReason("");
    } catch (error) {
      toast.error("Failed to add example");
      console.error("Error adding example:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Criteria Example</DialogTitle>
          <DialogDescription>
            Add a new criteria example for {fileName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="criteria">Criteria</Label>
            <Select value={criteriaId} onValueChange={setCriteriaId}>
              <SelectTrigger>
                <SelectValue placeholder="Select criteria" />
              </SelectTrigger>
              <SelectContent>
                {criterias.map((criteria) => (
                  <SelectItem key={criteria.id} value={criteria.id.toString()}>
                    {criteria.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Example Type</Label>
            <Select value={isPositive} onValueChange={setIsPositive}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">Positive Example</SelectItem>
                <SelectItem value="negative">Negative Example</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this is a good/bad example..."
              className="h-32"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || !criteriaId || !isPositive || !reason.trim()}
            >
              {loading ? "Adding..." : "Add Example"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
