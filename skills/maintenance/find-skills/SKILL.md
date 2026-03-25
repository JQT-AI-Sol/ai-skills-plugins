---
name: find-skills
description: Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", "clawhub", "ClawHub", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill. Searches both skills.sh and ClawHub registries.
---

# Find Skills

This skill helps you discover and install skills from the open agent skills ecosystem. It searches two registries: **skills.sh** and **ClawHub (OpenClaw)**.

## When to Use This Skill

Use this skill when the user:

- Asks "how do I do X" where X might be a common task with an existing skill
- Says "find a skill for X" or "is there a skill for X"
- Asks "can you do X" where X is a specialized capability
- Expresses interest in extending agent capabilities
- Wants to search for tools, templates, or workflows
- Mentions they wish they had help with a specific domain (design, testing, deployment, etc.)

## Search Sources

This skill searches **two registries** and presents combined results:

| Source | Search Command | Install Command | Browse |
| ------ | -------------- | --------------- | ------ |
| skills.sh | `npx skills find [query]` | `npx skills add <owner/repo@skill>` | https://skills.sh/ |
| ClawHub (OpenClaw) | `clawhub search [query]` | `clawhub install <skill>` | https://clawhub.com |

### skills.sh

The Skills CLI (`npx skills`) is the package manager for the open agent skills ecosystem. Skills are modular packages that extend agent capabilities with specialized knowledge, workflows, and tools.

**Key commands:**

- `npx skills find [query]` - Search for skills interactively or by keyword
- `npx skills add <package>` - Install a skill from GitHub or other sources
- `npx skills check` - Check for skill updates
- `npx skills update` - Update all installed skills

**Browse skills at:** https://skills.sh/

### ClawHub (OpenClaw)

ClawHub is the OpenClaw official skill hub. Install the CLI with `npm i -g clawhub`.

**Key commands:**

- `clawhub search [query]` - Search for skills by keyword
- `clawhub install <skill>` - Install a skill
- `clawhub install <skill> --version 1.2.3` - Install a specific version
- `clawhub update <skill>` - Update a skill to latest
- `clawhub update --all` - Update all installed skills
- `clawhub list` - List installed skills

**Default registry:** https://clawhub.com (override with `CLAWHUB_REGISTRY` or `--registry`)

**Browse skills at:** https://clawhub.com

## How to Help Users Find Skills

### Step 1: Understand What They Need

When a user asks for help with something, identify:

1. The domain (e.g., React, testing, design, deployment)
2. The specific task (e.g., writing tests, creating animations, reviewing PRs)
3. Whether this is a common enough task that a skill likely exists

### Step 2: Search for Skills

Search **both registries** with relevant queries:

```bash
# skills.sh
npx skills find [query]

# ClawHub
clawhub search [query]
```

For example:

- User asks "how do I make my React app faster?" → `npx skills find react performance` + `clawhub search "react performance"`
- User asks "can you help me with PR reviews?" → `npx skills find pr review` + `clawhub search "pr review"`
- User asks "I need to create a changelog" → `npx skills find changelog` + `clawhub search "changelog"`

The skills.sh command will return results like:

```
Install with npx skills add <owner/repo@skill>

vercel-labs/agent-skills@vercel-react-best-practices
└ https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
```

The clawhub command will return results from https://clawhub.com.

### Step 3: Present Options to the User

When you find relevant skills, present them to the user with:

1. The skill name, source (skills.sh or ClawHub), and what it does
2. The install command they can run
3. A link to learn more

Example response (skills.sh):

```
I found a skill that might help! The "vercel-react-best-practices" skill provides
React and Next.js performance optimization guidelines from Vercel Engineering.

To install it:
npx skills add vercel-labs/agent-skills@vercel-react-best-practices

Learn more: https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
```

Example response (ClawHub):

```
I found a skill on ClawHub! The "my-skill" skill provides ...

To install it:
clawhub install my-skill

Learn more: https://clawhub.com
```

If results are found from both registries, present them together so the user can choose.

### Step 4: Offer to Install

If the user wants to proceed, install from the appropriate source:

```bash
# From skills.sh
npx skills add <owner/repo@skill> -g -y

# From ClawHub
clawhub install <skill>
```

The skills.sh `-g` flag installs globally (user-level) and `-y` skips confirmation prompts.

## Common Skill Categories

When searching, consider these common categories:

| Category        | Example Queries                          |
| --------------- | ---------------------------------------- |
| Web Development | react, nextjs, typescript, css, tailwind |
| Testing         | testing, jest, playwright, e2e           |
| DevOps          | deploy, docker, kubernetes, ci-cd        |
| Documentation   | docs, readme, changelog, api-docs        |
| Code Quality    | review, lint, refactor, best-practices   |
| Design          | ui, ux, design-system, accessibility     |
| Productivity    | workflow, automation, git                |

## Tips for Effective Searches

1. **Use specific keywords**: "react testing" is better than just "testing"
2. **Try alternative terms**: If "deploy" doesn't work, try "deployment" or "ci-cd"
3. **Check popular sources**: Many skills come from `vercel-labs/agent-skills` or `ComposioHQ/awesome-claude-skills` (skills.sh) and various publishers on ClawHub
4. **Search both registries**: Always search both skills.sh and ClawHub for best coverage

## When No Skills Are Found

If no relevant skills exist in either registry:

1. Acknowledge that no existing skill was found on skills.sh or ClawHub
2. Offer to help with the task directly using your general capabilities
3. Suggest the user could create their own skill with `npx skills init` or publish to ClawHub

Example:

```
I searched for skills related to "xyz" on both skills.sh and ClawHub but didn't find any matches.
I can still help you with this task directly! Would you like me to proceed?

If this is something you do often, you could create your own skill:
npx skills init my-xyz-skill        # for skills.sh
clawhub publish ./my-skill ...       # for ClawHub
```
