// playwright.global-setup.ts
import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // No-op: permissions will be set per-context in config.
}

export default globalSetup;
