import * as p from "@clack/prompts";
import path from "node:path";
import { findGitRoot, getGitUserName } from "@/utils/git";
import { slugify } from "@/utils/slug";
import { contributorDir } from "@/utils/paths";
import { findAudioFile } from "@/utils/fs";
import { playAudio } from "@/utils/audio";
import { abort } from "@/utils/ui";
import { highlighter } from "@/utils/highlighter";

export async function testCommand(name?: string): Promise<void> {
  p.intro(highlighter.brand(" tagthat test "));

  const gitRoot = await findGitRoot();
  if (!gitRoot) {
    return abort("No git repository found. Run tagthat from inside a git repo.");
  }

  const resolvedName = name ?? (await getGitUserName());
  if (!resolvedName) {
    return abort("Could not resolve a name. Pass one explicitly: tagthat test <name>");
  }

  const slug = slugify(resolvedName);
  const dir = contributorDir(gitRoot, slug);

  p.log.info(`Name:  ${highlighter.bold(resolvedName)}`);
  p.log.info(`Slug:  ${highlighter.info(slug)}`);

  const audioFile = await findAudioFile(dir);

  if (!audioFile) {
    p.log.warn(`No audio file found in ${highlighter.muted(path.relative(gitRoot, dir))}`);
    p.outro(highlighter.muted("Nothing to play."));
    return;
  }

  p.log.info(`File:  ${highlighter.info(path.relative(gitRoot, audioFile))}`);

  const s = p.spinner();
  s.start("Playing…");

  try {
    await playAudio(audioFile);
    s.stop("Done");
  } catch (err) {
    s.stop("Playback failed", 1);
    return abort(err instanceof Error ? err.message : String(err));
  }

  p.outro(highlighter.success(highlighter.bold("Tag played successfully.")));
}
