import fs from 'fs/promises';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export async function extractTextFromFile(filePath: string, extension: string): Promise<string> {
  try {
    const ext = extension.toLowerCase().replace(/^\./, '');
    if (ext === 'txt' || ext === 'csv' || ext === 'json' || ext === 'md') {
      const buffer = await fs.readFile(filePath);
      return buffer.toString('utf-8');
    }

    if (ext === 'docx') {
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    }

    if (ext === 'pdf') {
      const buffer = await fs.readFile(filePath);
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return result.text || '';
    }

    return '';
  } catch (error) {
    console.error(`Error extracting text from file ${filePath}:`, error);
    return '';
  }
}
