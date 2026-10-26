import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function extractMediaFromExcel(excelPath: string, outputDir: string): string[] {
  fs.mkdirSync(outputDir, { recursive: true });

  const tempMediaDir = path.resolve(path.dirname(excelPath), 'sheet_extracted', 'xl', 'media');

  if (!fs.existsSync(tempMediaDir)) {
    try {
      execSync(`tar -xf "${excelPath}" -C "${path.resolve(path.dirname(excelPath), 'sheet_extracted')}" xl/media`, {
        stdio: 'ignore',
      });
    } catch {
      // Ignore stream exit code
    }
  }

  const extractedFiles: string[] = [];

  if (fs.existsSync(tempMediaDir)) {
    const files = fs.readdirSync(tempMediaDir);
    for (const file of files) {
      const src = path.join(tempMediaDir, file);
      const dest = path.join(outputDir, file);
      fs.copyFileSync(src, dest);
      extractedFiles.push(file);
    }
  }

  return extractedFiles;
}
