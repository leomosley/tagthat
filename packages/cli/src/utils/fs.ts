import fs from "node:fs/promises";
import path from "node:path";

const AUDIO_EXTENSIONS = [".mp3", ".wav"];

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

// Returns a random audio file from the directory, or null if none exist.
export const findAudioFile = async (dir: string): Promise<string | null> => {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return null;
  }

  const files = entries
    .filter((f) => AUDIO_EXTENSIONS.includes(path.extname(f).toLowerCase()))
    .map((f) => path.join(dir, f));

  if (files.length === 0) return null;

  return files[Math.floor(Math.random() * files.length)] ?? null;
};

export const ensureContributorSlot = async (
  dir: string
): Promise<{ existed: boolean }> => {
  const existed = await fileExists(dir);

  await fs.mkdir(dir, { recursive: true });

  const hasAudio = (await findAudioFile(dir)) !== null;

  if (!hasAudio) {
    try {
      await fs.writeFile(path.join(dir, ".gitkeep"), "", { flag: "wx" });
    } catch {
      // .gitkeep already exists — fine
    }
  }

  return { existed };
};
