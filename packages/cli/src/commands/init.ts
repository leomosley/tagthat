import * as p from "@clack/prompts";
import path from "node:path";
import { findGitRoot, getContributors } from "@/utils/git";
import { slugify } from "@/utils/slug";
import { writeAndInstallHook } from "@/utils/hook";
import { contributorDir } from "@/utils/paths";
import { ensureContributorSlot } from "@/utils/fs";
import { abort } from "@/utils/ui";
import { highlighter } from "@/utils/highlighter";

export async function initCommand(): Promise<void> {
  p.intro(highlighter.brand(" tagthat ") + highlighter.muted("— your push, your sound"));

  const s = p.spinner();

  s.start("Locating git repository…");
  const gitRoot = await findGitRoot();
  if (!gitRoot) {
    s.stop("Not found", 1);
    return abort("No git repository found. Run tagthat from inside a git repo.", "Setup failed.");
  }
  s.stop(highlighter.muted(gitRoot));

  s.start("Reading contributors from git log…");
  const contributors = await getContributors();
  s.stop(
    contributors.length > 0
      ? `Found ${highlighter.bold(String(contributors.length))} contributor(s)`
      : "No contributors found"
  );

  if (contributors.length === 0) {
    p.log.warn("Could not detect contributors. Add one with: tagthat add <name>");
  }

  const created: string[] = [];
  const skipped: string[] = [];

  for (const name of contributors) {
    const slug = slugify(name);
    if (!slug) continue;

    const dir = contributorDir(gitRoot, slug);
    const { existed } = await ensureContributorSlot(dir);

    if (existed) {
      skipped.push(name);
    } else {
      created.push(
        `${highlighter.success("+")} ${highlighter.bold(name)}\n` +
          `         ${highlighter.info(path.relative(gitRoot, dir))}`
      );
    }
  }

  s.start("Installing pre-push hook…");
  await writeAndInstallHook(gitRoot);
  s.stop("Hook installed at .git/hooks/pre-push");

  if (created.length > 0) {
    p.note(created.join("\n"), "Contributor directories created");
  }

  for (const name of skipped) {
    p.log.info(highlighter.muted(`[exists] ${name}`));
  }

  p.log.info(
    `Add any ${highlighter.info(".mp3")} or ${highlighter.info(".wav")} file into your contributor directory, commit it, and push — tagthat plays automatically.`
  );

  p.outro(highlighter.success(highlighter.bold("All set!")));
}
