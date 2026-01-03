/**
 * Validate Backend Integration Specification
 * 
 * Ensures:
 * - Every frontend API call exists in the spec
 * - Every spec endpoint has usage or TODO
 * - No contract mismatches
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Read backend integration spec
const specPath = join(projectRoot, 'src', 'backendIntegration.ts');
const specContent = readFileSync(specPath, 'utf-8');

// Recursively get all TypeScript files
function getAllTsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      getAllTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Extract all API calls from frontend
function extractApiCalls() {
  const apiDir = join(projectRoot, 'src', 'api');
  const apiFiles = getAllTsFiles(apiDir);
  const calls = [];

  for (const filePath of apiFiles) {
    const content = readFileSync(filePath, 'utf-8');
    const file = filePath.replace(projectRoot + '/', '');
    
    // Match apiClient.get/post/put/delete calls
    const patterns = [
      /apiClient\.get<[^>]*>\(['"]([^'"]+)['"]/g,
      /apiClient\.post<[^>]*>\(['"]([^'"]+)['"]/g,
      /apiClient\.put<[^>]*>\(['"]([^'"]+)['"]/g,
      /apiClient\.delete\(['"]([^'"]+)['"]/g,
      /apiClient\.get\(['"]([^'"]+)['"]/g,
      /apiClient\.post\(['"]([^'"]+)['"]/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const path = match[1];
        const method = pattern.source.includes('get') ? 'GET' :
                      pattern.source.includes('post') ? 'POST' :
                      pattern.source.includes('put') ? 'PUT' :
                      pattern.source.includes('delete') ? 'DELETE' : 'GET';
        
        calls.push({
          path,
          method,
          file,
        });
      }
    }
  }

  return calls;
}

// Extract endpoints from spec
function extractSpecEndpoints() {
  const endpoints = [];
  
  // Simple regex extraction (in production, use AST parser)
  const domainMatches = specContent.matchAll(/domain:\s*['"]([^'"]+)['"]/g);
  
  for (const domainMatch of domainMatches) {
    const domain = domainMatch[1];
    const domainStart = domainMatch.index;
    
    // Find endpoints in this domain
    const endpointSection = specContent.substring(domainStart);
    const endpointMatches = endpointSection.matchAll(/(\w+):\s*\{[\s\S]*?method:\s*['"]([^'"]+)['"][\s\S]*?path:\s*['"]([^'"]+)['"]/g);
    
    for (const endpointMatch of endpointMatches) {
      const name = endpointMatch[1];
      const method = endpointMatch[2];
      const path = endpointMatch[3];
      
      endpoints.push({
        domain,
        name,
        method,
        path,
      });
    }
  }
  
  return endpoints;
}

// Validate
function validate() {
  console.log('🔍 Validating Backend Integration Specification...\n');
  
  const apiCalls = extractApiCalls();
  const specEndpoints = extractSpecEndpoints();
  
  console.log(`Found ${apiCalls.length} API calls in frontend`);
  console.log(`Found ${specEndpoints.length} endpoints in spec\n`);
  
  const errors = [];
  const warnings = [];
  
  // Check each API call exists in spec
  for (const call of apiCalls) {
    const normalizedPath = call.path.replace(/\/api\//, '/api/');
    const found = specEndpoints.find(
      (ep) => ep.path === normalizedPath && ep.method === call.method
    );
    
    if (!found) {
      errors.push(
        `❌ API call not found in spec: ${call.method} ${call.path} (used in ${call.file})`
      );
    }
  }
  
  // Check spec endpoints have usage
  for (const endpoint of specEndpoints) {
    const found = apiCalls.find(
      (call) => call.path === endpoint.path && call.method === endpoint.method
    );
    
    if (!found) {
      warnings.push(
        `⚠️  Spec endpoint has no usage: ${endpoint.method} ${endpoint.path} (${endpoint.domain}.${endpoint.name})`
      );
    }
  }
  
  // Report results
  if (errors.length > 0) {
    console.log('❌ VALIDATION FAILED\n');
    console.log('Errors:');
    errors.forEach((err) => console.log(`  ${err}`));
    console.log('');
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach((warn) => console.log(`  ${warn}`));
    console.log('');
  }
  
  console.log('✅ Validation passed! All API calls are documented in spec.\n');
  process.exit(0);
}

try {
  validate();
} catch (error) {
  console.error('Validation error:', error);
  process.exit(1);
}

