import inquirer from "inquirer";
import { templates, type Template } from "./templates.js";
import {
  checkDirectoryExists,
  generateUniqueProjectName,
  type ResolveResult,
} from "./utils/resolve-project-name.js";

export interface UserAnswers {
  projectName: string;
  template: string;
}

export type ConflictAction = "custom" | "overwrite" | "rename";

export async function promptProjectName(): Promise<string> {
  const { projectName } = await inquirer.prompt<{ projectName: string }>([
    {
      type: "input",
      name: "projectName",
      message: "Enter project name:",
      default: "my-project",
      validate: (input: string) => {
        if (!input.trim()) {
          return "Project name cannot be empty";
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return "Project name can only contain letters, numbers, hyphens and underscores";
        }
        return true;
      },
    },
  ]);

  return projectName;
}

export async function promptTemplate(): Promise<Template> {
  const gitTemplates = templates.filter((t) => t.type === "git");
  const officialTemplates = templates.filter((t) => t.type !== "git");

  const choices = [
    ...gitTemplates.map((t) => ({
      name: `${t.name.padEnd(20)} - ${t.description}`,
      value: t.value,
    })),
    new inquirer.Separator("─".repeat(50)),
    ...officialTemplates.map((t) => ({
      name: `${t.name.padEnd(20)} - ${t.description}`,
      value: t.value,
    })),
  ];

  const { templateValue } = await inquirer.prompt<{ templateValue: string }>([
    {
      type: "list",
      name: "templateValue",
      message: "Select a project template:",
      choices,
    },
  ]);

  const selectedTemplate = templates.find((t) => t.value === templateValue);
  if (!selectedTemplate) {
    throw new Error(`Template not found: ${templateValue}`);
  }

  return selectedTemplate;
}

async function promptCustomProjectName(): Promise<string> {
  const { projectName } = await inquirer.prompt<{ projectName: string }>([
    {
      type: "input",
      name: "projectName",
      message: "Enter a new project name:",
      validate: (input: string) => {
        if (!input.trim()) {
          return "Project name cannot be empty";
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return "Project name can only contain letters, numbers, hyphens and underscores";
        }
        return true;
      },
    },
  ]);

  return projectName;
}

export async function promptConflictResolution(
  projectName: string
): Promise<ResolveResult> {
  const suggestedName = generateUniqueProjectName(projectName);

  const { action } = await inquirer.prompt<{ action: ConflictAction }>([
    {
      type: "list",
      name: "action",
      message: `Directory "${projectName}" already exists. What would you like to do?`,
      choices: [
        {
          name: "Enter a custom name",
          value: "custom",
        },
        {
          name: "Overwrite existing directory",
          value: "overwrite",
        },
        {
          name: `Rename to "${suggestedName}"`,
          value: "rename",
        },
      ],
    },
  ]);

  if (action === "overwrite") {
    return {
      projectName,
      shouldOverwrite: true,
    };
  }

  if (action === "rename") {
    return {
      projectName: suggestedName,
      shouldOverwrite: false,
    };
  }

  const customName = await promptCustomProjectName();
  return resolveProjectName(customName);
}

export async function resolveProjectName(
  projectName: string
): Promise<ResolveResult> {
  if (!checkDirectoryExists(projectName)) {
    return {
      projectName,
      shouldOverwrite: false,
    };
  }

  return promptConflictResolution(projectName);
}
