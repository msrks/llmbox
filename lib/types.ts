export interface FileInfo {
  id: number;
  name: string;
  originalName: string;
  size: number;
  mimeType: string | null;
  uploadType: string;
  lastModified: Date;
}
