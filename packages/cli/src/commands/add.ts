import * as p from "@clack/prompts";
import path from "node:path";
import { z } from "zod";
import { findGitRoot } from "@/utils/git";
import { slugify } from "@/utils/slug";
import { contributorDir, audioPaths } from "@/utils/paths";
import { ensureContributorSlot } from "@/utils/fs";
import { abort } from "@/utils/ui";
import { highlighter } from "@/utils/highlighter";

const nameSchema = z.string().min(1, "Name cannot be empty").max(128, "Name too long");

export async function addCommand(name: string): Promise<void> {
  p.intro(highlighter.brand(" tagthat add "));

  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) {
    return abort(parsed.error.errors[0]?.message ?? "Invalid name");
  }

  const gitRoot = await findGitRoot();
  if (!gitRoot) {
    return abort("No git repository found. Run tagthat from inside a git repo.");
  }

  const slug = slugify(name);
  if (!slug) {
    return abort(`"${name}" produces an empty slug. Use a name with letters or digits.`);
  }

  const dir = contributorDir(gitRoot, slug);
  const { mp3, wav } = audioPaths(dir, slug);
  const relMp3 = path.relative(gitRoot, mp3);
  const relWav = path.relative(gitRoot, wav);

  const { existed } = await ensureContributorSlot(dir, slug);

  if (existed) {
    p.log.warn(`${highlighter.bold(name)} already has a slot (slug: ${highlighter.info(slug)})`);
    p.note(`${highlighter.info(relMp3)}\n${highlighter.muted("or")}\n${highlighter.info(relWav)}`, "Drop your audio file here");
    p.outro(highlighter.muted("No changes made."));
    return;
  }

  p.log.success(`Created ${highlighter.success(path.relative(gitRoot, dir) + "/")} (slug: ${highlighter.info(slug)})`);
  p.note(`${highlighter.info(relMp3)}\n${highlighter.muted("or")}\n${highlighter.info(relWav)}`, "Drop your audio file here");
  p.outro(highlighter.success(highlighter.bold("Done!")));
}
