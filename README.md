# Merge & Tell for coding agents

One plugin, `merge-and-tell`, for Claude Code, Codex and Cursor. It gives your agent
two things:

- The Merge & Tell MCP server at `https://merge.tel/mcp`. The agent uses it to set up
  your account, connect GitHub and your social accounts, write drafts, and queue posts
  once you say yes.
- Two skills. `merge-and-tell` is the onboarding recipe. `merge-and-tell-icp` writes
  the reader your posts are framed for.

After installing, sign in once (below). Then ask your agent: "Set up Merge & Tell for
me."

[Merge & Tell](https://merge.tel) turns merged GitHub pull requests into social posts
on X, Bluesky, Mastodon, LinkedIn, Threads, Discord, Slack and WordPress. What the
plugin connects to, and what each tool can publish, is in the
[plugin README](plugins/merge-and-tell/README.md).

## Claude Code

```
/plugin marketplace add mergetel/agents
/plugin install merge-and-tell@mergetel
```

Or from a shell:

```bash
claude plugin marketplace add mergetel/agents
claude plugin install merge-and-tell@mergetel
```

Sign in: run `/mcp`, pick `plugin:merge-and-tell:merge-and-tell`, choose
Authenticate, and approve in the browser.

If you installed the plugin from `jfreal/mergetel` before October 2026, that
marketplace has the same name. Remove it first with
`claude plugin marketplace remove mergetel`, then add this one.

## Codex

```bash
codex plugin marketplace add mergetel/agents
codex plugin add merge-and-tell@mergetel
codex mcp login merge-and-tell
```

## Cursor

Cursor reads `.cursor-plugin/marketplace.json` and the plugin's portable
`plugin.json`. A team can add this repository to its team marketplace with Import from
Repo and the URL `https://github.com/mergetel/agents`.

Without a team marketplace, add the MCP server to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "merge-and-tell": { "url": "https://merge.tel/mcp" }
  }
}
```

## claude.ai and Claude Desktop

Add `https://merge.tel/mcp` as a custom connector (Settings > Connectors > Add custom
connector). That gives you the tools without the skills.

## What is in this repository

| Path | Read by |
| --- | --- |
| `.claude-plugin/marketplace.json` | Claude Code |
| `.agents/plugins/marketplace.json` | Codex |
| `.cursor-plugin/marketplace.json` | Cursor |
| `plugins/merge-and-tell/.claude-plugin/plugin.json`, `.mcp.json` | Claude Code |
| `plugins/merge-and-tell/plugin.json`, `mcp.json` | Codex and Cursor ([Agent Plugins](https://agent-plugins.org) format) |
| `plugins/merge-and-tell/skills/*/SKILL.md` | all three |

The skills are not written here. They are written in the Merge & Tell app repository,
published at <https://merge.tel/skills.txt>, and copied here once a day by
[`sync-skills.yml`](.github/workflows/sync-skills.yml). That workflow opens a pull
request and bumps the plugin's patch version. Edit a skill here and the next sync
overwrites it.

`node scripts/check.mjs` checks that every manifest names the same plugin, version,
marketplace and MCP address, and that the plugin README is long enough for Anthropic's
directory. CI runs it on every pull request, with `claude plugin validate`.

## License

MIT
