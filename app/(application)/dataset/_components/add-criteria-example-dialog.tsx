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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { Criteria } from "@/lib/db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface CriteriaState {
  id: number;
  isFail: boolean;
  reason: string;
}

interface AddCriteriaExampleDialogProps {
  fileId: number;
  fileName: string;
  criterias: Criteria[];
  onSubmit: (data: {
    fileId: number;
    criteriaId: number;
    isFail: boolean;
    reason: string | null;
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
  const [criteriaStates, setCriteriaStates] = useState<CriteriaState[]>(
    criterias.map((criteria) => ({
      id: criteria.id,
      isFail: false,
      reason: "",
    }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Submit each criteria example
      await Promise.all(
        criteriaStates.map((state) =>
          onSubmit({
            fileId,
            criteriaId: state.id,
            isFail: state.isFail,
            reason: state.reason?.trim() || null,
          })
        )
      );

      toast.success("Examples added successfully");
      setOpen(false);
      // Reset form
      setCriteriaStates(
        criterias.map((criteria) => ({
          id: criteria.id,
          isFail: false,
          reason: "",
        }))
      );
    } catch (error) {
      toast.error("Failed to add examples");
      console.error("Error adding examples:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCriteriaState = (
    id: number,
    updates: Partial<Omit<CriteriaState, "id">>
  ) => {
    setCriteriaStates((prev) =>
      prev.map((state) => (state.id === id ? { ...state, ...updates } : state))
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Criteria Examples</DialogTitle>
          <DialogDescription>
            Set examples for each criteria for {fileName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {criterias.map((criteria) => {
                const state = criteriaStates.find((s) => s.id === criteria.id)!;
                return (
                  <Card key={criteria.id}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base">{criteria.name}</Label>
                          {criteria.description && (
                            <p className="text-sm text-muted-foreground">
                              {criteria.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`type-${criteria.id}`}>
                            Fail Example
                          </Label>
                          <Switch
                            id={`type-${criteria.id}`}
                            checked={state.isFail}
                            onCheckedChange={(checked) =>
                              updateCriteriaState(criteria.id, {
                                isFail: checked,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`reason-${criteria.id}`}>Reason</Label>
                        <Textarea
                          id={`reason-${criteria.id}`}
                          value={state.reason}
                          onChange={(e) =>
                            updateCriteriaState(criteria.id, {
                              reason: e.target.value,
                            })
                          }
                          placeholder={`Explain why this ${
                            state.isFail ? "fails" : "passes"
                          } the criteria...`}
                          className="h-24"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Examples"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
