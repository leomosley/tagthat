import { $ } from "bun";
import os from "node:os";

// Plays an audio file synchronously using the native OS tool.
// Mirrors the platform logic in hook.sh.
export const playAudio = async (filePath: string): Promise<void> => {
  const platform = os.platform();
  const ext = filePath.split(".").pop();

  if (platform === "darwin") {
    await $`afplay ${filePath}`.quiet();
    return;
  }

  if (platform === "linux") {
    if (ext === "wav" && (await commandExists("aplay"))) {
      await $`aplay ${filePath}`.quiet();
    } else if (ext === "wav" && (await commandExists("paplay"))) {
      await $`paplay ${filePath}`.quiet();
    } else if (ext === "mp3" && (await commandExists("mpg123"))) {
      await $`mpg123 -q ${filePath}`.quiet();
    } else if (await commandExists("ffplay")) {
      await $`ffplay -nodisp -autoexit ${filePath}`.quiet();
    } else {
      throw new Error("No supported audio player found. Install aplay, mpg123, or ffplay.");
    }
    return;
  }

  if (platform === "win32") {
    if (ext === "wav") {
      await $`powershell.exe -NoProfile -NonInteractive -Command (New-Object Media.SoundPlayer '${filePath}').PlaySync()`.quiet();
    } else if (await commandExists("ffplay")) {
      await $`ffplay -nodisp -autoexit ${filePath}`.quiet();
    } else {
      throw new Error("No supported audio player found for MP3 on Windows. Install ffplay.");
    }
    return;
  }

  throw new Error(`Unsupported platform: ${platform}`);
};

const commandExists = async (cmd: string): Promise<boolean> => {
  try {
    await $`command -v ${cmd}`.quiet();
    return true;
  } catch {
    return false;
  }
};
