import { execa } from "execa";
import { logger } from "../utils/logger.js";

const SUPPORTED_PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;

export type PackageManager = (typeof SUPPORTED_PACKAGE_MANAGERS)[number];

export function getSupportedPackageManagers(): readonly PackageManager[] {
  return SUPPORTED_PACKAGE_MANAGERS;
}

function isPackageManager(value: string): value is PackageManager {
  return SUPPORTED_PACKAGE_MANAGERS.includes(value as PackageManager);
}

function normalizePackageManager(value: string): PackageManager {
  const normalized = value.trim().toLowerCase();

  if (!isPackageManager(normalized)) {
    throw new Error(
      `Unsupported package manager: ${value}. Use one of: ${SUPPORTED_PACKAGE_MANAGERS.join(", ")}`
    );
  }

  return normalized;
}

function detectPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent ?? "";

  if (userAgent.startsWith("pnpm")) {
    return "pnpm";
  }

  if (userAgent.startsWith("yarn")) {
    return "yarn";
  }

  if (userAgent.startsWith("bun")) {
    return "bun";
  }

  return "npm";
}

function getUpdateCommand(
  packageName: string,
  packageManager: PackageManager
): { command: string; args: string[] } {
  switch (packageManager) {
    case "pnpm":
      return {
        command: "pnpm",
        args: ["add", "-g", `${packageName}@latest`],
      };
    case "yarn":
      return {
        command: "yarn",
        args: ["global", "add", `${packageName}@latest`],
      };
    case "bun":
      return {
        command: "bun",
        args: ["add", "-g", `${packageName}@latest`],
      };
    case "npm":
    default:
      return {
        command: "npm",
        args: ["install", "-g", `${packageName}@latest`],
      };
  }
}

export async function updateCLI(
  packageName: string,
  preferredManager?: string
): Promise<void> {
  const packageManager = preferredManager
    ? normalizePackageManager(preferredManager)
    : detectPackageManager();
  const { command, args } = getUpdateCommand(packageName, packageManager);

  logger.info(`Updating ${packageName} with ${packageManager}...`);
  logger.log("");

  try {
    await execa(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    logger.success(`${packageName} has been updated to the latest version`);
  } catch (error) {
    throw error;
  }
}
