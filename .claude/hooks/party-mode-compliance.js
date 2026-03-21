#!/usr/bin/env node
/**
 * Party Mode Compliance Check (v9.2)
 *
 * Runs on PreToolUse(Bash) — blocks git commit for planning docs
 * if party mode rules were not followed.
 *
 * Checks:
 * 1. All critic party-log files exist for the stage being committed
 * 2. Each critic log has a "Cross-talk" section
 * 3. fixes.md exists for each step
 * 4. Grade A steps have 2+ cycles (multiple fixes files or Devil's Advocate section)
 * 5. Score standard deviation >= 0.5 (anti rubber-stamp)
 */

const fs = require('fs');
const path = require('path');

const MAX_STDIN = 1024 * 1024;
let raw = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  if (raw.length < MAX_STDIN) raw += chunk.substring(0, MAX_STDIN - raw.length);
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw);
    const command = (input.tool_input && input.tool_input.command) || '';

    // Only check git commit commands with planning messages
    if (!command.includes('git commit') || !command.includes('docs(planning)')) {
      process.stdout.write(raw);
      process.exit(0);
    }

    const errors = [];
    const warnings = [];
    const partyLogsDir = path.join(process.cwd(), 'party-logs');

    if (!fs.existsSync(partyLogsDir)) {
      errors.push('party-logs/ directory missing');
      report(errors, warnings);
      return;
    }

    // Detect which stage from commit message
    const stageMatch = command.match(/Stage\s+(\d+)/i);
    if (!stageMatch) {
      // Can't determine stage, just check basics
      process.stdout.write(raw);
      process.exit(0);
    }

    const stage = stageMatch[1];
    const files = fs.readdirSync(partyLogsDir);
    const stageFiles = files.filter(f => f.startsWith(`stage-${stage}-`));

    if (stageFiles.length === 0) {
      errors.push(`No party-logs for Stage ${stage}`);
      report(errors, warnings);
      return;
    }

    // Group by step
    const steps = new Map();
    for (const file of stageFiles) {
      // pattern: stage-{N}-step{M}-{name}.md or stage-{N}-{stepname}-{name}.md
      const match = file.match(/stage-\d+-(.+?)-([^-]+)\.md$/);
      if (match) {
        const stepKey = match[1];
        const critic = match[2];
        if (!steps.has(stepKey)) steps.set(stepKey, { critics: [], hasFixes: false, hasDevilsAdvocate: false });
        if (critic === 'fixes') {
          steps.get(stepKey).hasFixes = true;
        } else {
          steps.get(stepKey).critics.push({ name: critic, file });
        }
      }
    }

    for (const [stepKey, stepData] of steps) {
      // Check 1: At least 2 critic logs per step (excluding fixes)
      if (stepData.critics.length < 2) {
        errors.push(`Step ${stepKey}: only ${stepData.critics.length} critic(s) reviewed (need ≥2). Critics: ${stepData.critics.map(c => c.name).join(', ')}`);
      }

      // Check 2: fixes.md exists
      if (!stepData.hasFixes) {
        warnings.push(`Step ${stepKey}: no fixes.md found`);
      }

      // Check 3: Cross-talk section in each critic log
      for (const critic of stepData.critics) {
        const filePath = path.join(partyLogsDir, critic.file);
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (!/cross[\s-]?talk|교차[\s]?토론|교차[\s]?검토/i.test(content)) {
            errors.push(`Step ${stepKey}, ${critic.name}: NO cross-talk section in party-log`);
          }
        } catch (e) {
          warnings.push(`Step ${stepKey}: cannot read ${critic.file}`);
        }
      }

      // Check 4: Score extraction and stdev
      const scores = [];
      for (const critic of stepData.critics) {
        const filePath = path.join(partyLogsDir, critic.file);
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          // Look for final score patterns: "Score: 8/10", "점수: 8.5/10", "## Score: 8/10"
          const scoreMatches = content.match(/(?:score|점수|평점)[:\s]*(\d+\.?\d*)\s*\/\s*10/gi);
          if (scoreMatches && scoreMatches.length > 0) {
            const lastMatch = scoreMatches[scoreMatches.length - 1];
            const num = parseFloat(lastMatch.match(/(\d+\.?\d*)/)[1]);
            if (num > 0 && num <= 10) scores.push(num);
          }
        } catch (e) { /* skip */ }
      }

      if (scores.length >= 2) {
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
        const stdev = Math.sqrt(variance);

        if (stdev < 0.5) {
          warnings.push(`Step ${stepKey}: Score stdev=${stdev.toFixed(2)} < 0.5 (scores: ${scores.join(', ')}). SUSPICIOUS — possible rubber-stamping`);
        }
      }
    }

    report(errors, warnings);
  } catch (e) {
    // Non-blocking on parse errors
    process.stdout.write(raw);
    process.exit(0);
  }
});

function report(errors, warnings) {
  if (warnings.length > 0) {
    process.stderr.write(`\n⚠️  PARTY MODE WARNINGS:\n${warnings.map(w => `  - ${w}`).join('\n')}\n\n`);
  }

  if (errors.length > 0) {
    process.stderr.write(`\n🛑 PARTY MODE COMPLIANCE FAILED:\n${errors.map(e => `  - ${e}`).join('\n')}\n\n`);
    process.stderr.write(`Fix the above issues before committing planning docs.\n`);
    process.stdout.write(raw);
    process.exit(2); // Block the commit
  }

  process.stdout.write(raw);
  process.exit(0);
}
