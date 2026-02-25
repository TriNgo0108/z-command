import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import { execSync } from "child_process";

export type BumpType = "patch" | "minor" | "major";

export interface BumpOptions {
  type?: BumpType;
  dryRun?: boolean;
}

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

function parseVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
} {
  const parts = version.split(".").map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

function formatVersion(major: number, minor: number, patch: number): string {
  return `${major}.${minor}.${patch}`;
}

function bumpVersion(currentVersion: string, type: BumpType): string {
  const { major, minor, patch } = parseVersion(currentVersion);

  switch (type) {
    case "major":
      return formatVersion(major + 1, 0, 0);
    case "minor":
      return formatVersion(major, minor + 1, 0);
    case "patch":
    default:
      return formatVersion(major, minor, patch + 1);
  }
}

export async function bumpCommand(
  typeArg?: string | BumpOptions,
  options?: BumpOptions,
): Promise<void> {
  let opts: BumpOptions;
  let providedType: string | undefined;

  if (typeof typeArg === "string") {
    providedType = typeArg;
    opts = options || {};
  } else if (typeArg && typeof typeArg === "object") {
    opts = typeArg;
    providedType = opts.type;
  } else {
    opts = options || {};
  }

  const rawType = providedType || opts.type || "patch";
  const type = ["patch", "minor", "major"].includes(rawType)
    ? (rawType as BumpType)
    : "patch";
  const packageJsonPath = path.join(process.cwd(), "package.json");

  // Check if package.json exists
  if (!(await fs.pathExists(packageJsonPath))) {
    console.log(chalk.red("❌ No package.json found in current directory"));
    process.exit(1);
  }

  try {
    // Read package.json
    const packageJson: PackageJson = await fs.readJson(packageJsonPath);
    const currentVersion = packageJson.version;

    if (!currentVersion) {
      console.log(chalk.red("❌ No version field found in package.json"));
      process.exit(1);
    }

    const newVersion = bumpVersion(currentVersion, type);

    console.log(chalk.cyan("\n📦 Version Bump\n"));
    console.log(chalk.dim(`  Type: ${chalk.bold(type)}`));
    console.log(chalk.dim(`  Current: ${chalk.yellow(currentVersion)}`));
    console.log(chalk.dim(`  New: ${chalk.green(newVersion)}`));

    if (opts.dryRun) {
      console.log(chalk.yellow("\n⚠️  Dry run - no changes made\n"));
      return;
    }

    // Update package.json
    packageJson.version = newVersion;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    // Also update cli.ts version
    const cliPath = path.join(process.cwd(), "src", "cli.ts");
    if (await fs.pathExists(cliPath)) {
      let cliContent = await fs.readFile(cliPath, "utf-8");
      // Update .version('x.x.x') in cli.ts
      cliContent = cliContent.replace(
        /\.version\(['"`][\d.]+['"`]\)/,
        `.version('${newVersion}')`,
      );
      await fs.writeFile(cliPath, cliContent, "utf-8");
      console.log(chalk.dim("  ✓ Updated src/cli.ts version"));
    }

    // Sync package-lock.json
    const packageLockPath = path.join(process.cwd(), "package-lock.json");
    if (await fs.pathExists(packageLockPath)) {
      console.log(chalk.dim("  ✓ Syncing package-lock.json..."));
      try {
        execSync("npm install --package-lock-only", {
          cwd: process.cwd(),
          stdio: "ignore",
        });
        console.log(chalk.dim("  ✓ Updated package-lock.json"));
      } catch {
        console.log(chalk.yellow("  ⚠ Could not sync package-lock.json"));
      }
    }

    console.log(chalk.green(`\n✅ Version bumped to ${newVersion}\n`));

    // Suggest next steps
    console.log(chalk.bold("Next steps:"));
    console.log(chalk.dim(`  1. git add .`));
    console.log(
      chalk.dim(`  2. git commit -m "chore: bump version to ${newVersion}"`),
    );
    console.log(chalk.dim(`  3. git tag v${newVersion}`));
    console.log(chalk.dim(`  4. git push && git push --tags`));
    console.log();
  } catch (error) {
    console.log(
      chalk.red(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ),
    );
    process.exit(1);
  }
}
