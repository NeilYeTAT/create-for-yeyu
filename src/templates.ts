export interface Template {
  name: string;
  value: string;
  description: string;
  type: "git" | "vite" | "next";
  repo?: string;
}

export const templates: Template[] = [
  {
    name: "NestJS Starter",
    value: "nest",
    description: "NestJS application starter template",
    type: "git",
    repo: "for-yeyu/nest-app-starter-for-yeyu",
  },
  {
    name: "Next Web App Starter",
    value: "next-web-app",
    description: "Next Web App starter template",
    type: "git",
    repo: "for-yeyu/next-web-app-starter-for-yeyu",
  },
  {
    name: "EVM DApp Starter",
    value: "evm-dapp",
    description: "EVM DApp starter template",
    type: "git",
    repo: "for-yeyu/evm-dapp-starter-for-yeyu",
  },
  {
    name: "Hono App Starter",
    value: "hono",
    description: "Hono application starter template",
    type: "git",
    repo: "for-yeyu/hono-app-starter-for-yeyu",
  },
  {
    name: "Vite",
    value: "vite",
    description: "Create project with Vite official template",
    type: "vite",
  },
  {
    name: "Next.js",
    value: "next",
    description: "Create project with Create Next App",
    type: "next",
  },
];

export function getTemplateByValue(value: string): Template | undefined {
  return templates.find((t) => t.value === value);
}
