// Leonida Trophy Atlas — the hand-in program for the gta6-trophy-guide-01 bounty.
// Runs on Node 22 with the standard library only. It takes this repository's
// static guide (app/) and its browser screenshots (screenshots/), copies them
// into the output directory, and writes dossier.json there — the summary the
// judge reads — using the vendored make.fun library. The vendored library file
// vendor/makefun-frontend.ts must stay exactly as the kit shipped it: the
// scorer rebuilds the dossier with its own copy and compares the two.
//
// Local check, outside the grader's container:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The grader sets MAKEFUN_OUTPUT_DIR to /output itself; when the variable is
// absent this program writes to /output. Run it twice and the bytes must match.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const appSource = join(repoRoot, 'app');
const shotsSource = join(repoRoot, 'screenshots');
const appTarget = join(outputDir, 'app');
const shotsTarget = join(outputDir, 'screenshots');

// Start from a clean output tree so a stale file from an earlier run can
// never survive into the dossier. The grader runs this program twice and
// requires both runs to write identical bytes.
rmSync(appTarget, { recursive: true, force: true });
rmSync(shotsTarget, { recursive: true, force: true });
rmSync(join(outputDir, 'dossier.json'), { force: true });
mkdirSync(outputDir, { recursive: true });

cpSync(appSource, appTarget, { recursive: true });
mkdirSync(shotsTarget, { recursive: true });
if (existsSync(shotsSource)) {
  cpSync(shotsSource, shotsTarget, { recursive: true });
}

// Caps mirror the gate so this program refuses an entry the scorer would
// refuse: at most 4 screenshots, none over 256 KiB; app/ at most 993 files
// and directories and 48 MiB in all; the dossier text capped at 160 KiB.
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

mkdirSync(dirname(join(outputDir, 'dossier.json')), { recursive: true });
writeFileSync(join(outputDir, 'dossier.json'), dossierText);
