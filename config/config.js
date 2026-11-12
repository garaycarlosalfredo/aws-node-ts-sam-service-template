'use strict';

/**
 * Deploy-time configuration for serverless.yml.
 *
 * Merges `defaults.json` with `{stage}.json` (deep merge, stage wins).
 * Dependency-free on purpose: this file is evaluated by the Serverless
 * Framework CLI before anything else is loaded.
 */

const fs = require('node:fs');
const path = require('node:path');

const isPlainObject = value => typeof value === 'object' && value !== null && !Array.isArray(value);

const readJsonFile = filePath => {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const deepMerge = (target, source) => {
  const merged = { ...target };
  for (const [key, value] of Object.entries(source)) {
    merged[key] =
      isPlainObject(value) && isPlainObject(merged[key]) ? deepMerge(merged[key], value) : value;
  }
  return merged;
};

module.exports = serverless => {
  const stage = serverless?.options?.stage ?? process.env.NODE_ENV ?? 'development';
  const defaults = readJsonFile(path.join(__dirname, 'defaults.json'));
  const stageConfig = readJsonFile(path.join(__dirname, `${stage}.json`));
  return deepMerge(defaults, stageConfig);
};
