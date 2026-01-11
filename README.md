# z-command

[![npm version](https://img.shields.io/npm/v/@zimezone/z-command.svg)](https://www.npmjs.com/package/@zimezone/z-command)
[![npm downloads](https://img.shields.io/npm/dm/@zimezone/z-command.svg)](https://www.npmjs.com/package/@zimezone/z-command)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Install curated GitHub Copilot skills and agents for your project.

## Installation

```bash
npm install -g @zimezone/z-command
```

## Usage

### Initialize skills and agents

```bash
# Install all skills and agents to current project
z-command init

# Install to global user directory (~/.copilot/)
z-command init --global

# Install only skills
z-command init --skills

# Install only agents
z-command init --agents
```

### List available templates

```bash
z-command list
z-command list --skills
z-command list --agents
```

## Included Templates

### Skills

| Skill                     | Description                          |
| ------------------------- | ------------------------------------ |
| `test-driven-development` | RED-GREEN-REFACTOR cycle             |
| `systematic-debugging`    | 4-phase root cause process           |
| `code-review`             | Automated code review checklist      |
| `security-review`         | OWASP Top 10 vulnerability detection |
| `writing-plans`           | Detailed implementation plans        |

### Agents (80 total)

**01. Core Development**

- `api-designer`
- `backend-developer`
- `frontend-developer`
- `fullstack-developer`
- `mobile-developer`
- `ui-designer`
- `graphql-architect`
- `microservices-architect`
- `websocket-engineer`
- `electron-pro`

**02. Language Specialists**

- `typescript-pro`
- `python-pro`
- `golang-pro`
- `java-architect`
- `react-specialist`
- `nextjs-developer`
- `vue-expert`
- `angular-architect`
- `django-developer`
- `rails-expert`
- `laravel-specialist`
- `flutter-expert`
- `swift-expert`
- `kotlin-specialist`
- `csharp-developer`
- `cpp-pro`

**03. Infrastructure**

- `cloud-architect`
- `devops-engineer`
- `kubernetes-specialist`
- `terraform-engineer`
- `sre-engineer`
- `platform-engineer`
- `database-administrator`
- `network-engineer`
- `security-engineer`
- `azure-infra-engineer`

**04. Quality & Security**

- `code-reviewer`
- `security-analyst`
- `test-engineer`
- `accessibility-expert`
- `performance-optimizer`

**05. Data & AI**

- `ai-engineer`
- `ml-engineer`
- `data-scientist`
- `data-engineer`
- `llm-architect`
- `prompt-engineer`
- `nlp-engineer`
- `mlops-engineer`
- `postgres-pro`

**06. Developer Experience**

- `cli-developer`
- `documentation-engineer`
- `refactoring-specialist`
- `legacy-modernizer`
- `mcp-developer`
- `git-workflow-manager`
- `build-engineer`

**07. Specialized Domains**

- `blockchain-developer`
- `game-developer`
- `fintech-engineer`
- `iot-engineer`
- `embedded-systems`
- `payment-integration`
- `seo-specialist`

**08. Business & Product**

- `product-manager`
- `project-manager`
- `business-analyst`
- `technical-writer`
- `scrum-master`
- `ux-researcher`

**09. Meta & Orchestration**

- `workflow-orchestrator`
- `multi-agent-coordinator`
- `context-manager`
- `task-distributor`

**10. Research & Analysis**

- `research-analyst`
- `competitive-analyst`
- `market-researcher`
- `trend-analyst`
- `data-researcher`

## Output Structure

After running `z-command init`, your project will have:

```
.github/
├── skills/
│   ├── test-driven-development/
│   │   └── SKILL.md
│   ├── code-review/
│   │   └── SKILL.md
│   └── ...
└── agents/
    ├── backend-developer.agent.md
    ├── frontend-developer.agent.md
    └── ...
```

## Development

### Local Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Link locally for testing
npm link
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
```

### Local Development

```bash
# Run directly without building
npm run dev init
npm run dev list

# Or after npm link
z-command init
z-command list
```

## Sources

This project aggregates best practices from:

- [obra/superpowers](https://github.com/obra/superpowers)
- [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)
- [OneRedOak/claude-code-workflows](https://github.com/OneRedOak/claude-code-workflows)

## License

MIT
