import { createRequire } from "node:module";
import { Command, Option } from "commander";
import chalk from "chalk";
import {
  promptProjectName,
  promptTemplate,
  promptInitGit,
  resolveProjectName,
} from "./prompts.js";
import { getTemplateByValue, templates, type Template } from "./templates.js";
import { cloneRepo } from "./actions/clone-repo.js";
import { createViteProject } from "./actions/create-vite.js";
import { createNextProject } from "./actions/create-next.js";
import {
  getSupportedPackageManagers,
  updateCLI,
} from "./actions/update-cli.js";
import { logger } from "./utils/logger.js";
import { catSay, getGreetingMessage } from "./utils/cats.js";
import {
  checkDirectoryExists,
  generateUniqueProjectName,
  removeDirectory,
} from "./utils/resolve-project-name.js";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as {
  name: string;
  version: string;
};
const PACKAGE_NAME = packageJson.name;
const VERSION = packageJson.version;
const DEFAULT_PROJECT_NAME = "my-project";
const DEFAULT_TEMPLATE = "vite";
const AVAILABLE_TEMPLATES = templates.map((template) => template.value);

interface CreateCommandOptions {
  template?: string;
  force?: boolean;
  yes?: boolean;
  banner?: boolean;
  listTemplates?: boolean;
}

interface TemplateExecutionOptions {
  git?: boolean;
  yes: boolean;
}

interface UpdateCommandOptions {
  manager?: string;
}

function resolveGitOption(argv: string[] = process.argv): boolean | undefined {
  const gitIndex = argv.lastIndexOf("--git");
  const noGitIndex = argv.lastIndexOf("--no-git");

  if (gitIndex === -1 && noGitIndex === -1) {
    return undefined;
  }

  return gitIndex > noGitIndex;
}

async function executeTemplate(
  template: Template,
  projectName: string,
  shouldOverwrite: boolean,
  options: TemplateExecutionOptions
): Promise<void> {
  if (shouldOverwrite) {
    logger.info(`Removing existing directory ${projectName}...`);
    await removeDirectory(projectName);
  }

  if (template.type === "git") {
    if (!template.repo) {
      logger.error("Template repository not configured");
      process.exit(1);
    }

    const initGit = options.git ?? (options.yes ? true : await promptInitGit());
    await cloneRepo(template.repo, projectName, { initGit });
    printSuccessMessage(projectName);
  } else if (template.type === "vite") {
    if (options.git !== undefined) {
      logger.warning("`--git` and `--no-git` only apply to Git starter templates");
    }

    await createViteProject(projectName);
  } else if (template.type === "next") {
    if (options.git !== undefined) {
      logger.warning("`--git` and `--no-git` only apply to Git starter templates");
    }

    await createNextProject(projectName);
  }
}

function printSuccessMessage(projectName: string): void {
  console.log();
  logger.success(chalk.green.bold("🎉 Project created successfully!"));
  console.log();
  logger.log(chalk.cyan("  Next steps:"));
  logger.log(`    cd ${chalk.yellow(projectName)}`);
  logger.log(`    ${chalk.yellow("pnpm install")}`);
  logger.log(`    ${chalk.yellow("pnpm dev")}`);
  console.log();
}

function printBanner(): void {
  console.log();
  console.log(chalk.cyan(catSay(getGreetingMessage())));
  console.log();
}

function printTemplateList(): void {
  logger.log(chalk.cyan("Available templates:"));
  logger.log("");

  for (const template of templates) {
    logger.log(
      `  ${chalk.yellow(template.value.padEnd(14))} ${template.name.padEnd(22)} ${template.description}`
    );
  }

  logger.log("");
}

function getDefaultTemplate(): Template {
  const template = getTemplateByValue(DEFAULT_TEMPLATE);

  if (!template) {
    throw new Error(`Default template not found: ${DEFAULT_TEMPLATE}`);
  }

  return template;
}

async function resolveProjectTarget(
  projectName: string,
  options: Pick<CreateCommandOptions, "force" | "yes">
): Promise<{ projectName: string; shouldOverwrite: boolean }> {
  if (!checkDirectoryExists(projectName)) {
    return {
      projectName,
      shouldOverwrite: false,
    };
  }

  if (options.force) {
    return {
      projectName,
      shouldOverwrite: true,
    };
  }

  if (options.yes) {
    return {
      projectName: generateUniqueProjectName(projectName),
      shouldOverwrite: false,
    };
  }

  return resolveProjectName(projectName);
}

export async function run(): Promise<void> {
  const program = new Command();

  program
    .name(PACKAGE_NAME)
    .description("A CLI tool to scaffold projects from templates")
    .version(VERSION, "-v, --version", "Display the current version")
    .helpOption("-h, --help", "Display help for command")
    .showHelpAfterError()
    .showSuggestionAfterError()
    .configureHelp({
      sortOptions: true,
      sortSubcommands: true,
    })
    .addHelpText(
      "after",
      `
Examples:
  $ ${PACKAGE_NAME} my-app --template vite
  $ ${PACKAGE_NAME} my-app --template next-web-app --no-git
  $ ${PACKAGE_NAME} --list-templates
  $ ${PACKAGE_NAME} update --manager pnpm
`
    )
    .argument("[project-name]", "Project name")
    .addOption(
      new Option("-t, --template <template>", "Specify template").choices(
        AVAILABLE_TEMPLATES
      )
    )
    .option("-f, --force", "Overwrite an existing directory without prompting")
    .option("--git", "Always initialize git when the selected template supports it")
    .option(
      "--no-git",
      "Skip git initialization when the selected template supports it"
    )
    .option(
      "-y, --yes",
      `Use defaults when possible (${DEFAULT_PROJECT_NAME}, ${DEFAULT_TEMPLATE})`
    )
    .option("--list-templates", "Print available templates and exit")
    .option("--no-banner", "Disable the welcome banner")
    .action(
      async (projectName: string | undefined, options: CreateCommandOptions) => {
        if (options.listTemplates) {
          printTemplateList();
          return;
        }

        if (options.banner) {
          printBanner();
        }

        try {
          const gitOption = resolveGitOption(process.argv);
          const inputProjectName =
            projectName ??
            (options.yes ? DEFAULT_PROJECT_NAME : await promptProjectName());
          const { projectName: resolvedName, shouldOverwrite } =
            await resolveProjectTarget(inputProjectName, options);
          const template =
            options.template !== undefined
              ? getTemplateByValue(options.template)
              : options.yes
                ? getDefaultTemplate()
                : await promptTemplate();

          if (!template) {
            throw new Error("Selected template is not available");
          }

          await executeTemplate(template, resolvedName, shouldOverwrite, {
            git: gitOption,
            yes: options.yes ?? false,
          });
        } catch (error) {
          if (error instanceof Error) {
            logger.error(error.message);
          }
          process.exit(1);
        }
      }
    );

  program
    .command("update")
    .description(`Update ${PACKAGE_NAME} to the latest version`)
    .addOption(
      new Option(
        "-m, --manager <manager>",
        "Package manager to use for the update"
      ).choices(getSupportedPackageManagers())
    )
    .action(async (options: UpdateCommandOptions) => {
      try {
        await updateCLI(PACKAGE_NAME, options.manager);
      } catch (error) {
        if (error instanceof Error) {
          logger.error(error.message);
        }
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}
