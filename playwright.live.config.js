import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';
// Explicit opt-in when the preview's server is already running.
export default defineConfig({ ...base, webServer: undefined });
