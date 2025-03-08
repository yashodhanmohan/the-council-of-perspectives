import fs from 'fs';
import path from 'path';

function initShadcn() {
  // Create components directory if it doesn't exist
  const componentsDir = path.join(process.cwd(), 'src/components');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  // Create lib/utils.ts
  const utilsDir = path.join(process.cwd(), 'src/lib');
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }

  const utilsContent = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`;

  fs.writeFileSync(path.join(utilsDir, 'utils.ts'), utilsContent);

  // Add shadcn components directory
  const shadcnDir = path.join(componentsDir, 'ui');
  if (!fs.existsSync(shadcnDir)) {
    fs.mkdirSync(shadcnDir, { recursive: true });
  }
}

initShadcn();
