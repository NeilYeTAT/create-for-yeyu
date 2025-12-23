import fs from "fs-extra";
import path from "node:path";

export interface ResolveResult {
  projectName: string;
  shouldOverwrite: boolean;
}

export function checkDirectoryExists(projectName: string): boolean {
  const targetPath = path.resolve(process.cwd(), projectName);
  return fs.existsSync(targetPath);
}

export function generateUniqueProjectName(baseName: string): string {
  let counter = 1;
  let newName = `${baseName}-${counter}`;

  while (checkDirectoryExists(newName)) {
    counter++;
    newName = `${baseName}-${counter}`;
  }

  return newName;
}

export async function removeDirectory(projectName: string): Promise<void> {
  const targetPath = path.resolve(process.cwd(), projectName);
  await fs.remove(targetPath);
}
