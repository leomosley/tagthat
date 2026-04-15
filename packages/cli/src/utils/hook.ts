import path from "node:path";
import fs from "node:fs/promises";
import hookScript from "../templates/hook.sh" with { type: "text" };

export const HOOK_MARKER = "# tagthat:pre-push";

export function generateHookScript(): string {
  return hookScript;
}

// Appends to an existing .git/hooks/pre-push rather than overwriting it,
// and skips if the marker is already present (idempotent).
export async function writeAndInstallHook(gitRoot: string): Promise<void> {
  const hookContent = generateHookScript();
  const tagthatHooksDir = path.join(gitRoot, ".tagthat", "hooks");
  const tagthatHookPath = path.join(tagthatHooksDir, "pre-push");
  const gitHooksDir = path.join(gitRoot, ".git", "hooks");
  const gitHookPath = path.join(gitHooksDir, "pre-push");

  await fs.mkdir(tagthatHooksDir, { recursive: true });
  await fs.writeFile(tagthatHookPath, hookContent, { mode: 0o755 });

  await fs.mkdir(gitHooksDir, { recursive: true });

  let existingContent = "";
  try {
    existingContent = await fs.readFile(gitHookPath, "utf8");
  } catch {
    // file does not exist yet
  }

  if (existingContent.includes(HOOK_MARKER)) return;

  if (existingContent.length > 0) {
    const separator = existingContent.endsWith("\n") ? "\n" : "\n\n";
    await fs.writeFile(gitHookPath, existingContent + separator + hookContent, { mode: 0o755 });
  } else {
    await fs.writeFile(gitHookPath, hookContent, { mode: 0o755 });
  }

  await fs.chmod(gitHookPath, 0o755);
}
