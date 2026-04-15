import { $ } from "bun";
import path from "node:path";
import fs from "node:fs";

export async function findGitRoot(start: string = process.cwd()): Promise<string | null> {
  let current = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(current, ".git"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export async function getGitUserName(): Promise<string | null> {
  try {
    const result = await $`git config user.name`.text();
    const name = result.trim();
    return name.length > 0 ? name : null;
  } catch {
    return null;
  }
}

export async function getContributors(): Promise<string[]> {
  try {
    const result = await $`git log --format=%an`.quiet().text();
    const names = result
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);

    if (names.length > 0) {
      return [...new Set(names)];
    }
  } catch {
    // git log fails on repos with no commits — fall through to config
  }

  const current = await getGitUserName();
  return current ? [current] : [];
}
