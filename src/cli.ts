import { Command } from "commander";
import chalk from "chalk";
import {
  promptProjectName,
  promptTemplate,
  promptInitGit,
  resolveProjectName,
} from "./prompts.js";
import { getTemplateByValue, type Template } from "./templates.js";
import { cloneRepo } from "./actions/clone-repo.js";
import { createViteProject } from "./actions/create-vite.js";
import { createNextProject } from "./actions/create-next.js";
import { logger } from "./utils/logger.js";
import { cowsay, getGreetingMessage } from "./utils/cowsay.js";
import { removeDirectory } from "./utils/resolve-project-name.js";

const VERSION = "1.0.0";

interface CLIOptions {
  template?: string;
}

async function executeTemplate(
  template: Template,
  projectName: string,
  shouldOverwrite: boolean
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

    const initGit = await promptInitGit();
    await cloneRepo(template.repo, projectName, { initGit });
    printSuccessMessage(projectName);
  } else if (template.type === "vite") {
    await createViteProject(projectName);
  } else if (template.type === "next") {
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
  console.log(chalk.cyan(cowsay(getGreetingMessage())));
  console.log();
}

export async function run(): Promise<void> {
  const program = new Command();

  program
    .name("create-for-yeyu")
    .description("A CLI tool to scaffold projects from templates")
    .version(VERSION)
    .argument("[project-name]", "Project name")
    .option(
      "-t, --template <template>",
      "Specify template (nest, evm-dapp, vite, next)"
    )
    .action(async (projectName: string | undefined, options: CLIOptions) => {
      printBanner();

      try {
        let inputProjectName = projectName;
        let template: Template;

        if (!inputProjectName) {
          inputProjectName = await promptProjectName();
        }

        const { projectName: resolvedName, shouldOverwrite } =
          await resolveProjectName(inputProjectName);

        if (options.template) {
          const foundTemplate = getTemplateByValue(options.template);
          if (!foundTemplate) {
            logger.error(`Template not found: ${options.template}`);
            logger.info("Available templates: nest, evm-dapp, vite, next");
            process.exit(1);
          }
          template = foundTemplate;
        } else {
          template = await promptTemplate();
        }

        await executeTemplate(template, resolvedName, shouldOverwrite);
      } catch (error) {
        if (error instanceof Error) {
          logger.error(error.message);
        }
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}
