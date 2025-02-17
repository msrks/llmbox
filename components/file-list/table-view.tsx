import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileInfo } from "@/lib/types";
import { FileDeleteDialog } from "@/components/file-delete-dialog";

interface TableViewProps {
  files: FileInfo[];
  previewUrls: Record<number, string>;
  isImageFile: (mimeType: string | null) => boolean;
  onDownload: (fileId: number, originalName: string) => void;
  onDelete: (fileId: number) => Promise<void>;
}

export function TableView({
  files,
  previewUrls,
  isImageFile,
  onDownload,
  onDelete,
}: TableViewProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Preview</TableHead>
            <TableHead>Original Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Upload Type</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>
                {isImageFile(file.mimeType) ? (
                  <div className="relative w-16 h-16">
                    {previewUrls[file.id] ? (
                      <Image
                        src={previewUrls[file.id]}
                        alt={file.originalName}
                        fill
                        className="object-contain rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
                        <span className="text-sm text-muted-foreground">
                          Loading...
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-md">
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
                )}
              </TableCell>
              <TableCell className="font-medium">{file.originalName}</TableCell>
              <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
              <TableCell>
                <span className="capitalize">{file.uploadType}</span>
              </TableCell>
              <TableCell>
                {new Date(file.lastModified).toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => onDownload(file.id, file.originalName)}
                  >
                    Download
                  </Button>
                  <FileDeleteDialog
                    fileName={file.originalName}
                    onDelete={() => onDelete(file.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
