import fs from "node:fs/promises";
import path from "node:path";
import { audioPaths } from "@/utils/paths";

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const ensureContributorSlot = async (
  dir: string,
  slug: string
): Promise<{ existed: boolean }> => {
  const existed = await fileExists(dir);

  await fs.mkdir(dir, { recursive: true });

  const { mp3, wav } = audioPaths(dir, slug);
  const hasAudio = (await fileExists(mp3)) || (await fileExists(wav));

  if (!hasAudio) {
    try {
      await fs.writeFile(path.join(dir, ".gitkeep"), "", { flag: "wx" });
    } catch {
      // .gitkeep already exists — fine
    }
  }

  return { existed };
};
