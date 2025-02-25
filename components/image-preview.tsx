"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getPresignedUrlByFileNameAction } from "@/app/actions";
import { Loader } from "@/components/loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImagePreviewProps {
  fileName: string;
  className?: string;
  llmReason?: string;
}

export function ImagePreview({
  fileName,
  className = "",
  llmReason,
}: ImagePreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadUrl = async () => {
      try {
        if (mounted) {
          setUrl(await getPresignedUrlByFileNameAction(fileName));
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load presigned URL:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUrl();
    return () => {
      mounted = false;
    };
  }, [fileName]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-md ${className}`}
      >
        <Loader />
      </div>
    );
  }

  if (!url) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-md ${className}`}
      >
        <span className="text-sm text-muted-foreground">Failed to load</span>
      </div>
    );
  }

  if (llmReason) {
    console.log("llmReason", llmReason);
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`relative h-40 ${className}`}>
              <Image
                src={url}
                alt={fileName}
                fill
                className="object-contain rounded-md"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-2 text-sm">
            {llmReason}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`relative h-40 ${className}`}>
      <Image
        src={url}
        alt={fileName}
        fill
        className="object-contain rounded-md"
      />
    </div>
  );
}
