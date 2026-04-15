// Must produce identical output to the bash slug logic in hook.sh.
// Uses char-by-char replacement (no `+` greedy) to match sed exactly.
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
