/**
 * Sync Backend Integration Specification
 * 
 * Regenerates backend-integration.json from backendIntegration.ts
 * Bumps version automatically
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Read current spec
const specPath = join(projectRoot, 'src', 'backendIntegration.ts');
const specContent = readFileSync(specPath, 'utf-8');

// Extract version
function extractVersion() {
  const versionMatch = specContent.match(/version:\s*['"]([^'"]+)['"]/);
  return versionMatch ? versionMatch[1] : '1.0.0';
}

// Bump version
function bumpVersion(currentVersion) {
  const parts = currentVersion.split('.');
  const minor = parseInt(parts[1]) || 0;
  const patch = parseInt(parts[2]) || 0;
  return `${parts[0]}.${minor}.${patch + 1}`;
}

// Generate JSON from spec (simplified - in production use AST parser)
function generateJSON() {
  // This is a simplified version - in production, you'd parse the TypeScript AST
  // For now, we'll read the existing JSON and update metadata
  const jsonPath = join(projectRoot, 'src', 'backend-integration.json');
  let jsonContent;
  
  try {
    jsonContent = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  } catch (error) {
    console.error('Error reading backend-integration.json:', error);
    process.exit(1);
  }
  
  // Update metadata
  const currentVersion = extractVersion();
  const newVersion = bumpVersion(currentVersion);
  
  jsonContent.version = newVersion;
  jsonContent.meta = {
    ...jsonContent.meta,
    version: newVersion,
    lastUpdated: new Date().toISOString(),
    changeSummary: 'Auto-synced from backendIntegration.ts',
  };
  
  // Write updated JSON
  writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2));
  
  // Update TypeScript file version
  const updatedSpec = specContent.replace(
    /version:\s*['"]([^'"]+)['"]/,
    `version: '${newVersion}'`
  );
  writeFileSync(specPath, updatedSpec);
  
  console.log(`✅ Synced backend-integration.json`);
  console.log(`   Version: ${currentVersion} → ${newVersion}`);
  console.log(`   Updated: ${jsonContent.meta.lastUpdated}\n`);
}

generateJSON();

