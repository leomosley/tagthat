# tagthat

Play your producer tag on every git push.

```sh
npx tagthat
```

Drop any `.mp3` or `.wav` into `.tagthat/<your-name>/` and it plays automatically on every push.

## Commands

| Command | Description |
|---|---|
| `tagthat` | Set up tagthat in the current git repo |
| `tagthat add <name>` | Add a contributor slot |
| `tagthat test [name]` | Simulate a push and play your tag |

## Requirements

- macOS, Linux, or Windows
- Audio playback handled natively per OS (`afplay`, `aplay`/`paplay`/`mpg123`, PowerShell)
