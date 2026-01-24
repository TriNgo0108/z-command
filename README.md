# z-command

[![npm version](https://img.shields.io/npm/v/@zimezone/z-command.svg)](https://www.npmjs.com/package/@zimezone/z-command)
[![npm downloads](https://img.shields.io/npm/dm/@zimezone/z-command.svg)](https://www.npmjs.com/package/@zimezone/z-command)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Install curated AI coding assistant skills and agents for your project. Supports **GitHub Copilot**, **Claude Code**, **Antigravity**, and **Cursor**.

## Installation

```bash
npm install -g @zimezone/z-command
```

## Supported Platforms

| Platform       | Directory  | Agents            | Skills             |
| -------------- | ---------- | ----------------- | ------------------ |
| GitHub Copilot | `.github/` | ✅                | ✅                 |
| Claude Code    | `.claude/` | ✅                | ✅                 |
| Antigravity    | `.agent/`  | ✅ (as workflows) | ✅                 |
| Cursor         | `.cursor/` | ✅ (as rules)     | ✅ (nightly build) |

## Usage

### Initialize skills and agents

```bash
# Install for all platforms (default)
z-command init

# Install to global user directory
z-command init --global

# Install only skills
z-command init --skills

# Install only agents
z-command init --agents

# Install for specific platform
z-command init --target copilot
z-command init --target claude
z-command init --target antigravity
z-command init --target cursor

# Install for all platforms explicitly
z-command init --target all
```

### List available templates

```bash
z-command list
z-command list --skills
z-command list --agents
```

### Update z-command

```bash
z-command update
```

This command will unzip templates(which include skills and agents), flatten the structure, rename files to avoid collisions, and skip any agents that you have locally customized or explicitly excluded.

> [!NOTE]
> This command will also update `.git/info/exclude` to ignore `.agents`, `.skills`, and `.shared` directories to keep your repository clean.

## Included Templates

### Skills

| Skill                     | Description                                   |
| ------------------------- | --------------------------------------------- |
| `test-driven-development` | RED-GREEN-REFACTOR cycle                      |
| `systematic-debugging`    | 4-phase root cause process                    |
| `code-review`             | Automated code review checklist               |
| `security-review`         | OWASP Top 10 vulnerability detection          |
| `writing-plans`           | Detailed implementation plans                 |
| `ui-ux-pro-max`           | AI design intelligence for professional UI/UX |
| `bash-defensive-patterns` | Robust shell scripting patterns               |
| `python-packaging`        | Modern Python packaging (uv, poetry)          |
| `react-modernization`     | Modernizing React codebases                   |
| `rust-async-patterns`     | Async Rust implementation patterns            |
| `web-design-guidelines`   | Web Interface Guidelines compliance reviews   |

### Agents (150+ total)

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
- `rust-pro`
- `ruby-pro`
- `php-pro`
- `bash-pro`
- `c-pro`

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

### GitHub Copilot

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

### Claude Code

```
.claude/
├── skills/
│   └── .../SKILL.md
└── agents/
    └── *.agent.md
```

### Antigravity

```
.agent/
├── skills/
│   └── .../SKILL.md
└── workflows/
    └── *.md
```

### Cursor

```
.cursor/
└── rules/
    └── *.md
```

## Sources

This project aggregates best practices from:

- [obra/superpowers](https://github.com/obra/superpowers)
- [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)
- [OneRedOak/claude-code-workflows](https://github.com/OneRedOak/claude-code-workflows)
- [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) - UI/UX design intelligence
- [wshobson/agents](https://github.com/wshobson/agents) - 100+ specialized agents and skills

## License

MIT
