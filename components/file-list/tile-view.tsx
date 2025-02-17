import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FileInfo } from "@/lib/types";

interface TileViewProps {
  files: FileInfo[];
  previewUrls: Record<number, string>;
  isImageFile: (mimeType: string | null) => boolean;
  onDownload: (fileId: number, originalName: string) => void;
  onDelete: (fileId: number) => void;
}

export function TileView({
  files,
  previewUrls,
  isImageFile,
  onDownload,
  onDelete,
}: TileViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="border rounded-lg p-4 space-y-4 hover:shadow-md transition-shadow"
        >
          <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
            {isImageFile(file.mimeType) ? (
              previewUrls[file.id] ? (
                <Image
                  src={previewUrls[file.id]}
                  alt={file.originalName}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    Loading...
                  </span>
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-muted-foreground"
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
            )}
          </div>
          <div className="space-y-2">
            <h3 className="font-medium truncate" title={file.originalName}>
              {file.originalName}
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{(file.size / 1024).toFixed(2)} KB</p>
              <p className="capitalize">{file.uploadType}</p>
              <p>{new Date(file.lastModified).toLocaleString()}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onDownload(file.id, file.originalName)}
              >
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => onDelete(file.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
