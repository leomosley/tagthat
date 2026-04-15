import path from "node:path";

export const tagthatDir = (gitRoot: string): string =>
  path.join(gitRoot, ".tagthat");

export const contributorDir = (gitRoot: string, slug: string): string =>
  path.join(tagthatDir(gitRoot), slug);

export const audioPaths = (dir: string, slug: string): { mp3: string; wav: string } => ({
  mp3: path.join(dir, `${slug}.mp3`),
  wav: path.join(dir, `${slug}.wav`),
});
