import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Criteria } from "@/lib/db/schema";
import { updateCriteriaAction } from "./actions";
import { Pencil } from "lucide-react";
export function EditCriteriaDialog({ criteria }: { criteria: Criteria }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Criteria</DialogTitle>
        </DialogHeader>
        <form action={updateCriteriaAction}>
          <input type="hidden" name="id" value={criteria.id.toString()} />
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
            <Button type="submit">Update Criteria</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
