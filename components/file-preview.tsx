"use client";

import { ImagePreview } from "@/components/image-preview";

interface FilePreviewProps {
  fileName: string;
  mimeType: string | null;
  className?: string;
}

export function FilePreview({
  fileName,
  mimeType,
  className = "",
}: FilePreviewProps) {
  const isImage = mimeType?.startsWith("image/") || false;

  if (!isImage) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-md ${className}`}
      >
        <svg
          className="w-8 h-8 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return <ImagePreview fileName={fileName} className={className} />;
}
