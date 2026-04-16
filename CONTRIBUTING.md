# Contributing

## Setup

```sh
git clone https://github.com/leomosley/tagthat.git
cd tagthat
bun install
```

## Development

Work off the `dev` branch. Open PRs targeting `dev`, not `main`.

```sh
git checkout dev
git checkout -b your-feature
```

## CLI

```sh
# typecheck
bun run typecheck --filter=tagthat

# build
bun run build --filter=tagthat

# run locally
bun run packages/cli/src/index.ts
```

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org). This repo uses `git-cliff` to auto-generate changelogs and bump versions on release.

```
feat: add something new
fix: correct a bug
chore: boring but necessary
```

## PRs

Keep them small and focused. CI must pass before merging.
