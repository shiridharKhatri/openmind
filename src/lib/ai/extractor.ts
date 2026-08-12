import fs from 'fs/promises';
import mammoth from 'mammoth';

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
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdf = require('pdf-parse');
      const data = await pdf(buffer);
      return data.text || '';
    }

    return '';
  } catch (error) {
    console.error(`Error extracting text from file ${filePath}:`, error);
    return '';
  }
}
