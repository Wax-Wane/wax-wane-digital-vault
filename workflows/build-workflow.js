// Assembles the n8n workflow JSON from the source files in workflows/src/.
// Keeping JS in standalone files (rather than hand-escaped inside JSON) means
// reviewers can read and lint the Code-node logic directly.
//
// Run:  node workflows/build-workflow.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const SRC  = path.join(__dirname, 'src');

const normalize = fs.readFileSync(path.join(SRC, 'normalize-input.js'), 'utf8');
const generate  = fs.readFileSync(path.join(SRC, 'generate-copy.js'), 'utf8');
const buildCsv  = fs.readFileSync(path.join(SRC, 'build-csvs.js'), 'utf8');

const sample = JSON.parse(fs.readFileSync(path.join(ROOT, 'examples', 'sample-input.json'), 'utf8'));

function uuid() { return crypto.randomUUID(); }

const workflow = {
  name: 'Wax | Wane — Bulk Listing Generator (Amazon + Walmart)',
  nodes: [
    {
      parameters: {},
      id: uuid(),
      name: 'Manual Trigger',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [240, 200],
    },
    {
      parameters: {
        mode: 'raw',
        jsonOutput: JSON.stringify(sample, null, 2),
        options: {},
      },
      id: uuid(),
      name: 'Sample Input (Manual)',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [460, 200],
    },
    {
      parameters: {
        httpMethod: 'POST',
        path: 'wax-wane/bulk-listings',
        responseMode: 'responseNode',
        options: {},
      },
      id: uuid(),
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [240, 480],
      webhookId: uuid(),
    },
    {
      parameters: {
        jsCode: normalize,
      },
      id: uuid(),
      name: 'Normalize Input',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [720, 340],
    },
    {
      parameters: {
        jsCode: generate,
      },
      id: uuid(),
      name: 'Generate Wax | Wane Copy',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [960, 340],
    },
    {
      parameters: {
        mode: 'runOnceForAllItems',
        jsCode: buildCsv,
      },
      id: uuid(),
      name: 'Build Amazon + Walmart CSVs',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1200, 340],
    },
    {
      parameters: {
        respondWith: 'allIncomingItems',
        options: {},
      },
      id: uuid(),
      name: 'Respond to Webhook',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [1440, 480],
      continueOnFail: true,
    },
  ],
  connections: {
    'Manual Trigger':              { main: [[{ node: 'Sample Input (Manual)', type: 'main', index: 0 }]] },
    'Sample Input (Manual)':       { main: [[{ node: 'Normalize Input',       type: 'main', index: 0 }]] },
    'Webhook Trigger':             { main: [[{ node: 'Normalize Input',       type: 'main', index: 0 }]] },
    'Normalize Input':             { main: [[{ node: 'Generate Wax | Wane Copy', type: 'main', index: 0 }]] },
    'Generate Wax | Wane Copy':    { main: [[{ node: 'Build Amazon + Walmart CSVs', type: 'main', index: 0 }]] },
    'Build Amazon + Walmart CSVs': { main: [[{ node: 'Respond to Webhook', type: 'main', index: 0 }]] },
  },
  active: false,
  settings: {
    executionOrder: 'v1',
    saveExecutionProgress: true,
    saveManualExecutions: true,
  },
  staticData: null,
  meta: {
    description:
      'Bulk listing generator for Wax | Wane. Accepts JSON or CSV input, ' +
      'produces Amazon and Walmart bulk-template CSVs with Clinical Glow / ' +
      'Quiet Luxury copy. Brand suffix " | Wax | Wane" is appended only to ' +
      'titles in the HARAMOON skincare line.',
  },
  tags: [
    { name: 'wax-wane' },
    { name: 'listings' },
    { name: 'amazon' },
    { name: 'walmart' },
  ],
};

const outPath = path.join(ROOT, 'workflows', 'wax-wane-bulk-listing-generator.workflow.json');
fs.writeFileSync(outPath, JSON.stringify(workflow, null, 2) + '\n');
console.log('Wrote', path.relative(ROOT, outPath));
