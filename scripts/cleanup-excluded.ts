
import fs from 'fs-extra';
import path from 'path';

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const AGENTS_DIR = path.join(TEMPLATES_DIR, 'agents');
const SKILLS_DIR = path.join(TEMPLATES_DIR, 'skills');

const EXCLUSION_PATTERNS = [
  'web3',
  'startup',
  'istio',
  'market',
  'k8s',
  'kubernetes',
  'linkerd',
  'airflow',
  'attack-tree',
  'gdpr',
  'game',
  'hybrid-cloud',
  'gitlab',
  'gitops',
  'multi-cloud',
  'on-call',
  'solidity',
  'sol',
  'unity',
  'binary-analysis',
  'billing-automation',
  'anti-reversing',
  'team-composition',
  'screen-reader',
  'postmortem',
  'service-mesh-observability',
  'embedding-strategies',
  'godot',
  'hybrid-search',
  'incident-runbook',
  'kpi-dashboard',
  'memory-safety',
  'mtls',
  'protocol-reverse',
  'spark-optimization',
  'sast',
  'saga',
  'stride-analysis',
  'turborepo',
  'bazel',
  'bats',
  'bash-defensive',
  'backtesting',
  'memory-forensics',
  'ml-pipeline-workflow',
  'nft-standards'
];

function isExcluded(name: string): boolean {
  return EXCLUSION_PATTERNS.some(pattern => name.toLowerCase().includes(pattern.toLowerCase()));
}

async function cleanup() {
  console.log('Cleaning up excluded files...');
  
  // Cleanup agents
  if (await fs.pathExists(AGENTS_DIR)) {
      const agents = await fs.readdir(AGENTS_DIR);
      for (const agent of agents) {
          if (isExcluded(agent)) {
              console.log(`Deleting agent: ${agent}`);
              await fs.remove(path.join(AGENTS_DIR, agent));
          }
      }
  }

  // Cleanup skills
  if (await fs.pathExists(SKILLS_DIR)) {
      const skills = await fs.readdir(SKILLS_DIR);
      for (const skill of skills) {
          if (isExcluded(skill)) {
              console.log(`Deleting skill: ${skill}`);
              await fs.remove(path.join(SKILLS_DIR, skill));
          }
      }
  }
}

cleanup().catch(console.error);
