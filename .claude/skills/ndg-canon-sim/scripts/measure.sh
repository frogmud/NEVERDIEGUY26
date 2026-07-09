#!/usr/bin/env bash
# measure.sh - QA the latest eternal-days leg + the chatbase.
# Usage: measure.sh [run-dir]   (default: newest logs/eternal-* with a final-state.json)
# Run from anywhere; resolves the ai-engine package relative to this script.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG="$(cd "$SCRIPT_DIR/../../../../packages/ai-engine" && pwd)"
LOGS="$PKG/logs"
CB="$PKG/chatbase"

# --- pick the run ---
if [ $# -ge 1 ]; then
  RUN="$1"; [ -d "$RUN" ] || RUN="$LOGS/$1"
else
  RUN=""
  for d in $(ls -dt "$LOGS"/eternal-* 2>/dev/null); do
    [ -f "$d/final-state.json" ] && RUN="$d" && break
  done
fi
[ -n "$RUN" ] && [ -d "$RUN" ] || { echo "ERROR: no completed run found"; exit 1; }

echo "=== RUN: $(basename "$RUN") ==="
node -e "
const s=JSON.parse(require('fs').readFileSync('$RUN/final-state.json','utf8'));
console.log('world total days:', s.daysSimulated);
console.log('player: deaths', s.playerState.totalDeaths, '| rescues', s.playerState.totalRescues,
  '| debt', [...Object.values(s.playerState.debtsToNPCs||{})].reduce((a,b)=>a+b,0), 'gold');
"
DAYS=$(ls "$RUN/days" 2>/dev/null | wc -l | tr -d ' ')
echo "days this leg: $DAYS"

# --- dialogue QA ---
echo ""
echo "=== DIALOGUE QA (this leg) ==="
TOTAL=$(grep -h '^> ' "$RUN"/days/*.md 2>/dev/null | wc -l | tr -d ' ')
# exclude system 'Newcomer' lines from the truncation check
TRUNC=$(grep -h '^> ' "$RUN"/days/*.md 2>/dev/null | grep -v '^> \(died\|completed\|flumed\)' | grep -cvE '[.!?"'"'"')\*]$' || true)
DASH=$(grep -h '^> ' "$RUN"/days/*.md 2>/dev/null | grep -c $'—\|–' || true)
echo "dialogue lines: $TOTAL | truncated: $TRUNC (want 0) | em/en dashes: $DASH (want 0)"
echo "lines/day: $(( DAYS > 0 ? TOTAL / DAYS : 0 )) (claude legs average 4-7; near 0 = API trouble)"

# --- canon checks ---
echo ""
echo "=== CANON CHECKS ==="
KJ_BAD=$(grep -h 'King James' "$RUN"/days/*.md 2>/dev/null | grep -E 'beats King James|King James.*beats' | grep -v 'at sun' | grep -c 'at ' || true)
echo "King James matches off the Sun: $KJ_BAD (want 0 - see field-guide reconciliation #10)"
BOOTS_TALKS=$( (grep -hc '^\*\*Boots\*\*' "$RUN"/days/*.md 2>/dev/null || true) | awk '{s+=$1} END {print s+0}')
echo "Boots dialogue lines: $BOOTS_TALKS (want 0 - Boots never talks, canon lock)"

# --- catchphrase wear (verbatim quotes across the leg) ---
echo ""
echo "=== CATCHPHRASE WEAR (verbatim count in this leg; >3 per week-leg = worn) ==="
while IFS= read -r p; do
  n=$(grep -h '^> ' "$RUN"/days/*.md 2>/dev/null | grep -c "$p" || true)
  [ "$n" -gt 0 ] && printf '  %-42s %s\n' "\"$p\"" "$n"
done <<'PHRASES'
Seven come eleven
forged consent form
So is your cardio
wants for nothing
Burn, read, repeat
NDG WINS ALWAYS
I saved the receipt
Death is not the end
remixes the invoice
You all came cheap
PHRASES

# --- chatbase state ---
echo ""
echo "=== CHATBASE ==="
node -e "
const fs=require('fs');
const m=JSON.parse(fs.readFileSync('$CB/manifest.json','utf8'));
console.log('total entries:', m.stats?.totalEntries ?? '(see manifest)');
let dash=0, trunc=0, per={};
for(const f of fs.readdirSync('$CB/npcs')){
  const d=JSON.parse(fs.readFileSync('$CB/npcs/'+f,'utf8'));
  per[f.replace('.json','')]= (d.entries||[]).length;
  for(const e of (d.entries||[])){
    if(/[—–]/.test(e.text)) dash++;
    if(!/[.!?…\"')\]]$/.test(e.text.trim())) trunc++;
  }
}
console.log('em dashes in chatbase:', dash, '(want 0) | truncated entries:', trunc, '(want 0)');

// Cover rank = character importance (field-guide 03-cast.md). Distribution
// should roughly follow rank: core four on top, wanderers on the tail.
const RANK={'keith-man':2,'the-general':3,'stitch-up-girl':4,'mr-kevin':5,'boo-g':6,
'clausen':7,'rhea':8,'king-james':10,'body-count':11,'john':13,'jane':14,'robert':15,
'alice':16,'peter':17,'the-one':18,'zero-chance':19,'mr-bones':20,'boots':21,
'willy':22,'xtreme':23,'dr-maxwell':24,'dr-voss':25};
console.log('');
console.log('entries by cover rank (rank: slug entries):');
const rows=Object.entries(per).sort((a,b)=>(RANK[a[0]]??99)-(RANK[b[0]]??99));
for(const [slug,n] of rows) console.log('  '+String(RANK[slug]??'?').padStart(2)+': '+slug.padEnd(16)+n);
const counts=Object.values(per).sort((a,b)=>a-b);
const median=counts[Math.floor(counts.length/2)]||0;
const starved=rows.filter(([s,n])=>(RANK[s]??99)<=5 && n<median).map(([s,n])=>s+' ('+n+' < median '+median+')');
if(starved.length) console.log('WARN core-four underrepresented: '+starved.join(', '));
else console.log('core four at or above median - distribution OK');
"
echo ""
echo "Next: read $RUN/blog.md against ../comic/field-guide/ (see SKILL.md measure rubric)"
