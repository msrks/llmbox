import { createDataStreamResponse, streamText } from "ai";
import { createOllama } from "ollama-ai-provider";

const ollama = createOllama({});

const model = ollama("llama3.2");

export async function POST(req: Request) {
  const { messages } = await req.json();

  return await createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model,
        messages,
        maxSteps: 5,
        experimental_telemetry: {
          isEnabled: true,
          functionId: "stream-text",
        },
      });

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: () => {
      return "Oops, an error occured!";
    },
  });
}
