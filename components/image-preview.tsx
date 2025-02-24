"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getPresignedUrlByFileNameAction } from "@/app/actions";
import { Loader } from "@/components/loader";

interface ImagePreviewProps {
  fileName: string;
  className?: string;
}

export function ImagePreview({ fileName, className = "" }: ImagePreviewProps) {
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
