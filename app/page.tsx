import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Rocket, ArrowRight, Laptop } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="mb-8 mt-20 flex flex-col items-center justify-center text-center sm:mt-28">
        <Badge className="mb-4 px-4 text-sm" variant="secondary">
          Welcome to the AGI Revolution
        </Badge>
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          <span className="text-primary">LLMBox</span>: Your Gateway to the
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {" "}
            AI Future
          </span>
        </h1>
        <div className="mt-6 space-y-3">
          <p className="max-w-2xl text-muted-foreground sm:text-lg">
            Step into the next evolution of AI. From model retraining to
            data-driven prompt optimization. From CNN to LLM. The future is
            here, and it&apos;s prompt-driven.
          </p>
          <p className="max-w-2xl text-muted-foreground sm:text-lg">
            Run anywhere - edge, local, or cloud. Your data, your control. No
            internet required.
          </p>
        </div>

        <Link href="/projects" className="mt-6">
          <Button size="lg" className="group">
            Start Your Journey
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-4 max-w-5xl">
          <div className="flex flex-col items-center p-5 rounded-lg border bg-card text-card-foreground shadow-sm">
            <Brain className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">
              Beyond Traditional ML
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Transition from CNN to LLM-powered solutions with zero friction
            </p>
          </div>

          <div className="flex flex-col items-center p-5 rounded-lg border bg-card text-card-foreground shadow-sm">
            <Sparkles className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">Prompt-Driven Future</h3>
            <p className="text-sm text-muted-foreground text-center">
              Optimize your prompts with data-driven insights and testing
            </p>
          </div>

          <div className="flex flex-col items-center p-5 rounded-lg border bg-card text-card-foreground shadow-sm">
            <Laptop className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">Offline First</h3>
            <p className="text-sm text-muted-foreground text-center">
              Work seamlessly offline. Your data stays local, secure, and always
              accessible
            </p>
          </div>

          <div className="flex flex-col items-center p-5 rounded-lg border bg-card text-card-foreground shadow-sm">
            <Rocket className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-2">AGI Ready</h3>
            <p className="text-sm text-muted-foreground text-center">
              Stay ahead of the curve in the rapidly evolving AI landscape
            </p>
          </div>
        </div>
      </div>

      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-96 -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative h-[400px] w-full rotate-[20deg] bg-gradient-to-tr from-primary to-secondary opacity-30"
          />
        </div>
      </div>
    </div>
  );
}
