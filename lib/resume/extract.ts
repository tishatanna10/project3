import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

export const maximumResumeFileSize = 5 * 1024 * 1024;

export function isSupportedResumeFile(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || name.endsWith(".docx");
}

export async function extractResumeText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.name.toLowerCase().endsWith(".pdf")) {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    try {
      return (await extractText(pdf, { mergePages: true })).text;
    } finally {
      await pdf.cleanup();
    }
  }

  return (await mammoth.extractRawText({ buffer })).value;
}
