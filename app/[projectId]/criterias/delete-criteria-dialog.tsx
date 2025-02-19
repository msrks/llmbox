import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteCriteriaAction } from "./actions";
import { Trash } from "lucide-react";

export function DeleteCriteriaDialog({ id }: { id: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Trash className="h-4 w-4 mr-2" />
          Delete Criteria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Delete Criteria</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this criteria?
          </DialogDescription>
        </DialogHeader>
        <form action={deleteCriteriaAction}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit">Delete</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
