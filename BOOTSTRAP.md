# BOOTSTRAP: how this project's autonomous build is set up

Owner document. The build agent must not edit it. All setup lives in this
repo, so anyone can reproduce or change it.

## Pieces

| Path | What it is |
| --- | --- |
| `MISSION.md` | Product brief, read by the agent every iteration |
| `STEERING.md` | Owner's running instructions (edit on GitHub; pulled before each iteration) |
| `AGENTS.md` | Standing engineering rules that Codex loads automatically |
| `ops/vm/provision.sh` | **Run on your laptop.** Creates the exe.dev VM, adds the GitHub integration, clones the repo, runs setup |
| `ops/vm/setup.sh` | **Run on the VM.** Idempotent: Node/pnpm, Docker, git identity, secrets file, Codex config, user lingering, harness install, offline harness tests, real Codex smoke test |
| `ops/agent-control/` | Supervisor harness (`run.sh`, `control.py`, systemd unit, iteration prompt, tests); installed to `~/agent-control/` |

## One-time provisioning (from the laptop)

Prerequisites:
- `gh` logged in
- `ssh exe.dev` works
- the exe.dev `llm` integration is attached `auto:all`, with OpenAI set to
  your ChatGPT subscription

```bash
START=1 bash ops/vm/provision.sh
```

## How the loop works

The `news-digest-agent.service` systemd user unit runs `~/agent-control/run.sh`
continuously. Each iteration:
- fast-forwards from `origin/main`, so your edits to `STEERING.md` on GitHub
  are picked up
- runs a fresh `codex exec` with `ITERATION_PROMPT.md`
- guards the owner files
- pushes any unpushed commits
- health-checks the app

**Failures never end the run.** Crashes, timeouts and no-commit turns retry
after 5 minutes. Usage limits (for example the 5-hour window) and
authentication errors retry every 15 minutes until they clear. The unit also
restarts the supervisor if it dies, and starts it at boot. Only a STOP file
(or a `RUN_HOURS` deadline) ends a run. See `ops/agent-control/README.md`.

## Day-to-day commands (on the VM: `ssh news-digest.exe.xyz`)

```bash
cat ~/agent-control/status/heartbeat.json              # where is it?
journalctl --user -u news-digest-agent.service -f      # live supervisor log
touch ~/agent-control/STOP                             # graceful stop
bash ~/agent-control/stop-now.sh                       # immediate stop
rm -f ~/agent-control/STOP && systemctl --user start news-digest-agent.service   # resume
```

## Changing the harness

Edit `ops/agent-control/*` here and push. Then on the VM:

```bash
touch ~/agent-control/STOP
# wait until the heartbeat state is "stopped"
cd ~/news-digest && git pull
bash ops/agent-control/install.sh
rm -f ~/agent-control/STOP
systemctl --user start news-digest-agent.service
```
