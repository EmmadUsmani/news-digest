#!/usr/bin/env bash
# Compact status for lead sessions. Read-only, apart from `git pull`.
# Usage: status.sh [hours]. Prints no secrets.
set -u
hours="${1:-12}"
since="$(date -u -v-"${hours}"H +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "${hours} hours ago" +%Y-%m-%dT%H:%M:%SZ)"

git pull --quiet --rebase 2>&1 | tail -2
echo "== Now: $(date -u '+%Y-%m-%d %H:%M UTC')"
echo "== Commits in the last ${hours}h: $(git log --since="$since" --format=%h | wc -l | tr -d ' ')"
TZ=UTC git log --since="$since" --date=format-local:'%m-%d %H:%M' --format='%h %ad %s' | cut -c1-100 | head -30
echo "== Latest acks"
grep '^ack:' STEERING.md | tail -3 | cut -c1-500
echo "== Latest progress"
awk '/^## /{h=$0} END{print h}' PROGRESS.md

ssh news-digest.exe.xyz bash -s <<'REMOTE'
cd ~/news-digest || exit 1
export XDG_RUNTIME_DIR=/run/user/1000
echo "== VM"
echo "services: $(systemctl --user is-active news-digest-api news-digest-worker news-digest-agent | tr '\n' ' ')"
curl -s -o /dev/null -w 'healthz: %{http_code}\n' localhost:8000/healthz
df -h / | awk 'NR==2 {print "disk: " $5 " used, " $4 " free"}'
ls -t ~/backups/news-digest/*.dump 2>/dev/null | head -1 | sed 's/.*\//latest backup: /'
journalctl --user -u news-digest-agent -n 80 --no-pager | grep -o 'weekly=[0-9?]*%*' | tail -1
echo "== Alerts"
pnpm -s obs alerts 2>&1 | python3 -c '
import json, sys
d = json.loads(sys.stdin.read().strip().splitlines()[-1])
print("firing", d["firing"], "pending", d["pending"])
for a in d["alerts"]:
    print(" ", a["state"], a["labels"].get("alertname"), a["labels"].get("unit", ""))
'
echo "== X experiment"
python3 -c '
import json, os
p = os.path.expanduser("~/.local/state/news-digest/x-experiment/budget.json")
e = json.load(open(p))["entries"]
spent = sum(x["actualMicros"] if x.get("actualMicros") is not None else x.get("reservedMicros", 0) for x in e)
print("calls", len(e), "charged $%.2f of $2.50" % (spent / 1e6))
'
echo "== Latest edition"
email="$(sed -n 's/^ADMIN_EMAILS=//p' ~/.config/news-digest/env | cut -d, -f1)"
curl -s localhost:8000/api/admin/digest-previews/latest -H "X-ExeDev-Email: $email" | python3 -c '
import json, sys
from collections import Counter
d = json.load(sys.stdin)
print(d.get("createdAt"), d.get("id"))
for t in d["topics"]:
    e = t.get("editorial") or {}
    posts = dict(Counter(p.get("platform") for p in t.get("posts") or []))
    print(" ", t["name"], "| stories", len(t["stories"]), "|", e.get("mode"), "| posts", posts)
'
REMOTE
