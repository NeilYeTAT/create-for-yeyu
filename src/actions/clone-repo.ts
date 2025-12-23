import degit from "degit";
import { execa } from "execa";
import path from "node:path";
import { createTrainAnimation } from "../utils/train-animation.js";
import { logger } from "../utils/logger.js";

export interface CloneRepoOptions {
  initGit?: boolean;
}

export async function cloneRepo(
  repo: string,
  projectName: string,
  options: CloneRepoOptions = {}
): Promise<void> {
  const { initGit = true } = options;
  const targetPath = path.resolve(process.cwd(), projectName);
  const train = createTrainAnimation(`Cloning template ${repo}...`);

  train.start();

  try {
    const emitter = degit(repo, {
      cache: false,
      force: true,
      verbose: false,
    });

    await emitter.clone(targetPath);
    train.stop(true, "Template cloned successfully!");

    if (initGit) {
      await execa("git", ["init"], { cwd: targetPath });
      await execa("git", ["add", "."], { cwd: targetPath });
      await execa(
        "git",
        ["commit", "-m", "initial commit from create-for-yeyu"],
        { cwd: targetPath }
      );
      logger.success("Git repository initialized with initial commit");
    }
  } catch (error) {
    train.stop(false, "Failed to clone template");
    if (error instanceof Error) {
      logger.error(error.message);
    }
    throw error;
  }
}
