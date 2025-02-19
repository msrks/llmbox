import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createCriteriaAction } from "./actions";

export function AddCriteriaDialog({ projectId }: { projectId: number }) {
  return (
    <Dialog>
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
        <form action={createCriteriaAction} className="space-y-6">
          <div className="space-y-4">
            <input type="hidden" name="projectId" value={projectId} />
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
            <Button type="submit">Create Criteria</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
