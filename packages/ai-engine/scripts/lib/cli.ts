/**
 * Shared CLI utilities for simulation scripts
 *
 * Consolidates arg parsing, progress display, and common CLI patterns.
 */

// ============================================
// Arg Parsing
// ============================================

/**
 * Parse command line arguments with defaults
 * Supports --key=value, --flag (boolean), -key=value formats
 */
export function parseArgs<T extends Record<string, unknown>>(
  args: string[],
  defaults: T
): T {
  const opts = { ...defaults };

  for (const arg of args) {
    // Skip non-flag arguments
    if (!arg.startsWith('-')) continue;

    // Parse --key=value or -key=value
    const match = arg.match(/^-{1,2}([^=]+)(?:=(.*))?$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    const normalizedKey = key.replace(/-/g, '_'); // kebab-case to snake_case

    // Find matching key in defaults (check both kebab and snake case)
    const defaultKey = Object.keys(defaults).find(
      k => k === key || k === normalizedKey || k.replace(/_/g, '-') === key
    );

    if (!defaultKey) continue;

    const defaultValue = defaults[defaultKey as keyof T];

    // Coerce value based on default type
    let value: unknown;
    if (typeof defaultValue === 'boolean') {
      // Boolean flags: --flag means true, --flag=false means false
      value = rawValue === undefined ? true : rawValue !== 'false';
    } else if (typeof defaultValue === 'number') {
      value = parseInt(rawValue ?? '0', 10);
    } else {
      value = rawValue ?? '';
    }

    (opts as Record<string, unknown>)[defaultKey] = value;
  }

  return opts;
}

// ============================================
// Progress Display
// ============================================

/**
 * Create a progress bar string
 */
export function progressBar(current: number, total: number, width = 30): string {
  const percent = Math.min(current / total, 1);
  const filled = Math.round(width * percent);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const pct = (percent * 100).toFixed(1).padStart(5);
  return `[${bar}] ${pct}% (${current}/${total})`;
}

/**
 * Log progress to console with optional label
 */
export function logProgress(label: string, current: number, total: number): void {
  process.stdout.write(`\r${label}: ${progressBar(current, total)}`);
  if (current >= total) {
    console.log(); // New line when complete
  }
}

/**
 * Create a spinner for indeterminate progress
 */
export function createSpinner(label: string): {
  update: (message?: string) => void;
  stop: (message?: string) => void;
} {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frameIndex = 0;
  let currentMessage = label;

  const interval = setInterval(() => {
    process.stdout.write(`\r${frames[frameIndex]} ${currentMessage}`);
    frameIndex = (frameIndex + 1) % frames.length;
  }, 80);

  return {
    update: (message?: string) => {
      if (message) currentMessage = message;
    },
    stop: (message?: string) => {
      clearInterval(interval);
      process.stdout.write(`\r✓ ${message || currentMessage}\n`);
    },
  };
}

// ============================================
// Help & Usage
// ============================================

/**
 * Generate help text from defaults object
 */
export function generateHelp(
  scriptName: string,
  description: string,
  defaults: Record<string, unknown>,
  descriptions?: Record<string, string>
): string {
  const lines = [
    `${scriptName} - ${description}`,
    '',
    'Usage:',
    `  npx tsx scripts/${scriptName}.ts [options]`,
    '',
    'Options:',
  ];

  for (const [key, value] of Object.entries(defaults)) {
    const kebabKey = key.replace(/_/g, '-');
    const type = typeof value === 'boolean' ? 'flag' : typeof value;
    const desc = descriptions?.[key] || '';
    const defaultStr = typeof value === 'boolean' ? '' : ` (default: ${value})`;
    lines.push(`  --${kebabKey.padEnd(20)} [${type}] ${desc}${defaultStr}`);
  }

  return lines.join('\n');
}

// ============================================
// Common Patterns
// ============================================

/**
 * Handle SIGINT gracefully
 */
export function setupGracefulShutdown(
  cleanup: () => void | Promise<void>,
  message = 'Interrupted, cleaning up...'
): void {
  let shuttingDown = false;

  process.on('SIGINT', async () => {
    if (shuttingDown) {
      console.log('\nForce quit');
      process.exit(1);
    }
    shuttingDown = true;
    console.log(`\n${message}`);
    await cleanup();
    process.exit(0);
  });
}

/**
 * Format duration in ms to human readable
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Validate required options
 */
export function validateRequired<T extends Record<string, unknown>>(
  opts: T,
  required: (keyof T)[]
): void {
  const missing = required.filter(key => {
    const value = opts[key];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw new Error(`Missing required options: ${missing.join(', ')}`);
  }
}
