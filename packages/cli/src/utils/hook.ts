import path from "node:path";
import fs from "node:fs/promises";
import hookScript from "../templates/hook.sh" with { type: "text" };

export const HOOK_MARKER = "# tagthat:pre-push";

export function generateHookScript(): string {
  return hookScript;
}

// Appends to an existing .git/hooks/pre-push rather than overwriting it.
// If a tagthat block is already present, replaces it in-place so the hook
// stays up to date when hook.sh changes.
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

  let newContent: string;

  if (existingContent.includes(HOOK_MARKER)) {
    // Replace the existing tagthat block (everything from the marker onwards)
    const before = existingContent.slice(0, existingContent.indexOf(HOOK_MARKER)).trimEnd();
    newContent = before.length > 0 ? `${before}\n\n${hookContent}` : hookContent;
  } else if (existingContent.length > 0) {
    const separator = existingContent.endsWith("\n") ? "\n" : "\n\n";
    newContent = existingContent + separator + hookContent;
  } else {
    newContent = hookContent;
  }

  await fs.writeFile(gitHookPath, newContent, { mode: 0o755 });
  await fs.chmod(gitHookPath, 0o755);
}
