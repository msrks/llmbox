import { notFound } from "next/navigation";
import { getEvaluationDetails } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EvaluationDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getEvaluationDetails(parseInt(params.id));

  if (!result.success) {
    notFound();
  }

  const { data: evaluation } = result;

  return (
    <div className="container space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/evaluation-results">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Evaluation Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">ID</div>
              <div>{evaluation.id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Created At</div>
              <div>
                {new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }).format(new Date(evaluation.createdAt))}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge
                variant={
                  evaluation.state === "running"
                    ? "secondary"
                    : evaluation.state === "failed"
                    ? "destructive"
                    : "default"
                }
              >
                {evaluation.state.charAt(0).toUpperCase() +
                  evaluation.state.slice(1)}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Score</div>
              <div>{evaluation.score?.toFixed(1)}%</div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Final Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <pre className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                {evaluation.finalPrompt}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Evaluation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evaluation.evalResults?.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        result.result === "correct" ? "default" : "destructive"
                      }
                    >
                      {result.result.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      }).format(new Date(result.createdAt))}
                    </span>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Input
                    </div>
                    <pre className="p-2 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                      {result.input}
                    </pre>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Output
                    </div>
                    <pre className="p-2 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                      {result.output}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
