import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertCriteriaAction } from "./actions";
import Link from "next/link";
import { Criteria } from "@/lib/db/schema";

export default async function UpsertForm({
  projectId,
  criteria,
}: {
  projectId: string;
  criteria?: Criteria;
}) {
  return (
    <form action={upsertCriteriaAction} className="space-y-6">
      <div className="space-y-4">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="id" value={criteria?.id} />
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={criteria?.name ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={criteria?.description ?? ""}
            className="resize-none min-h-[120px]"
            rows={4}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Link href={`/${projectId}/criterias`}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit">
          {criteria ? "Update Criteria" : "Create Criteria"}
        </Button>
      </div>
    </form>
  );
}
