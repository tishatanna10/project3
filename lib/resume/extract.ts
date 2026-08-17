import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const maximumResumeFileSize = 5 * 1024 * 1024;

export function isSupportedResumeFile(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || name.endsWith(".docx");
}

export async function extractResumeText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.name.toLowerCase().endsWith(".pdf")) {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      return (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  }

  return (await mammoth.extractRawText({ buffer })).value;
}
