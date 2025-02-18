import { Label } from "./db/schema";

export interface FileInfo {
  id: number;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string | null;
  uploadType: string;
  lastModified: Date;
  humanLabel?: Label | null;
  aiLabel?: Label | null;
}
