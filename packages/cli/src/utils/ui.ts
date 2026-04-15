import * as p from "@clack/prompts";
import { highlighter } from "@/utils/highlighter";

export const abort = (message: string, outroMessage = "Aborted."): never => {
  p.log.error(message);
  p.outro(highlighter.error(outroMessage));
  process.exit(1);
};
