import { input, Separator } from "@inquirer/prompts";
import { templates, type Template } from "./templates.js";
import {
  checkDirectoryExists,
  generateUniqueProjectName,
  type ResolveResult,
} from "./utils/resolve-project-name.js";
import { vimSelect } from "./utils/vim-select.js";

export interface UserAnswers {
  projectName: string;
  template: string;
}

export type ConflictAction = "custom" | "overwrite" | "rename";

export async function promptProjectName(): Promise<string> {
  const projectName = await input({
    message: "Enter project name:",
    default: "my-project",
    validate: (value: string) => {
      if (!value.trim()) {
        return "Project name cannot be empty";
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
        return "Project name can only contain letters, numbers, hyphens and underscores";
      }
      return true;
    },
  });

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
    new Separator("─".repeat(50)),
    ...officialTemplates.map((t) => ({
      name: `${t.name.padEnd(20)} - ${t.description}`,
      value: t.value,
    })),
  ];

  const templateValue = await vimSelect({
    message: "Select a project template:",
    choices,
  });

  const selectedTemplate = templates.find((t) => t.value === templateValue);
  if (!selectedTemplate) {
    throw new Error(`Template not found: ${templateValue}`);
  }

  return selectedTemplate;
}

export async function promptInitGit(): Promise<boolean> {
  const initGit = await vimSelect<boolean>({
    message: "Initialize a new git repository?",
    choices: [
      {
        name: "Yes",
        value: true,
      },
      {
        name: "No",
        value: false,
      },
    ],
  });

  return initGit;
}

async function promptCustomProjectName(): Promise<string> {
  const projectName = await input({
    message: "Enter a new project name:",
    validate: (value: string) => {
      if (!value.trim()) {
        return "Project name cannot be empty";
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
        return "Project name can only contain letters, numbers, hyphens and underscores";
      }
      return true;
    },
  });

  return projectName;
}

export async function promptConflictResolution(
  projectName: string
): Promise<ResolveResult> {
  const suggestedName = generateUniqueProjectName(projectName);

  const action = await vimSelect<ConflictAction>({
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
  });

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
