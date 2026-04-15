#!/usr/bin/env bun

import { Command } from "commander";
import { initCommand } from "@/commands/init";
import { addCommand } from "@/commands/add";
import { testCommand } from "@/commands/test";

const program = new Command();

program
  .name("tagthat")
  .description("Play your producer tag when you push to git")
  .version("0.1.0", "-v, --version", "Output the current version");

program
  .command("init", { isDefault: true })
  .description("Set up tagthat in the current git repository")
  .action(async () => {
    await initCommand();
  });

program
  .command("add <name>")
  .description("Add a contributor slot for the given name")
  .action(async (name: string) => {
    await addCommand(name);
  });

program
  .command("test [name]")
  .description("Simulate a push and play your tag (uses git config user.name if no name given)")
  .action(async (name?: string) => {
    await testCommand(name);
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
