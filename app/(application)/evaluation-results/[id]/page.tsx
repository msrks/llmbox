import { notFound } from "next/navigation";
import { getEvaluationDetails } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PromptEvaluation, EvalResultRow, File, Label } from "@/lib/db/schema";
import Image from "next/image";

type EvaluationWithDetails = PromptEvaluation & {
  evalResults: (EvalResultRow & {
    file: File & {
      humanLabel: Label | null;
    };
    llmLabel: Label;
  })[];
  previewUrls: Record<string, string>;
};

export default async function EvaluationDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getEvaluationDetails(parseInt(params.id));

  if (!result.success) {
    notFound();
  }

  const evaluation = result.data as EvaluationWithDetails;

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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {evaluation.evalResults?.map((result) => (
                <div
                  key={result.id}
                  className="border rounded-lg overflow-hidden bg-card"
                >
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={
                          result.result === "correct"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {result.result.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        }).format(new Date(result.createdAt))}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 space-y-3">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Input
                      </div>
                      {result.file.mimeType?.startsWith("image/") ? (
                        <div className="relative aspect-square w-full bg-muted rounded-md overflow-hidden">
                          <Image
                            src={evaluation.previewUrls[result.file.fileName]}
                            alt={result.file.originalName}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className="text-sm truncate"
                          title={result.file.originalName}
                        >
                          {result.file.originalName}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Output
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Human
                          </Badge>
                          <div className="text-sm bg-muted p-2 rounded-md flex-1">
                            {result.file.humanLabel?.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            LLM
                          </Badge>
                          <div className="text-sm bg-muted p-2 rounded-md flex-1">
                            {result.llmLabel.name}
                          </div>
                        </div>
                      </div>
                    </div>
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
