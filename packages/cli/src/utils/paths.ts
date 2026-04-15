import path from "node:path";

export const tagthatDir = (gitRoot: string): string =>
  path.join(gitRoot, ".tagthat");

export const contributorDir = (gitRoot: string, slug: string): string =>
  path.join(tagthatDir(gitRoot), slug);

