# Merge & Tell plugin

[Merge & Tell](https://merge.tel) watches your merged GitHub pull requests, drafts
social posts from them, and publishes those posts to the accounts you connect. This
plugin lets a coding agent set up and run a Merge & Tell account for you. It contains
one MCP server connection and two skills. It contains no hooks, no commands, no
scripts and no local server, so nothing from this plugin runs on your machine.

## What it connects to

The plugin adds one remote MCP server, `merge-and-tell`, at `https://merge.tel/mcp`.
Merge & Tell runs that server. Your agent talks to it over HTTPS and to nothing else.

You sign in with OAuth 2.1. The first call opens a browser on merge.tel, where you sign
in to your Merge & Tell account and approve the scopes the agent asked for:

- `read` lets it look at your account, repositories, drafts, queue and settings.
- `configure` lets it change settings, write drafts, attach media and start connections.
- `publish` lets it queue posts for publishing and turn on publishing without approval.

An access token lasts one hour and a refresh token lasts 30 days. You can revoke the
agent's access at any time on https://merge.tel/app/account. The plugin never holds
the token itself. Your agent's MCP client stores it.

## What the tools can do

The server has about 60 tools. Most read your account or change its settings. These
are the ones that reach outside Merge & Tell:

- `approve_pr` queues a pull request's drafts to publish on your connected X, Bluesky,
  Mastodon, LinkedIn, Threads, Discord, Slack, WordPress and WordPress.com accounts.
  It does nothing until it is called again with `confirm: true`. Your agent should
  show you the plan first, and the onboarding skill tells it to.
- `save_routing_rules` can set a network to publish on merge with nobody approving each
  post. A save that adds publishing needs the `publish` scope and `confirm: true`.
- `disconnect` revokes a connected social account's token at the network. It also
  needs `confirm: true`.
- `begin_social_connect`, `get_secret_form_link`, `get_github_install_link` and
  `get_checkout_link` return links for you to open: a network's OAuth page, a form on
  merge.tel for a pasted credential, the GitHub App install page, and Stripe Checkout.
  No tool accepts a password, app password, webhook URL or card number. You type those
  into merge.tel or the network, never into the chat.
- `get_product_evidence`, `derive_brief` and `derive_voice` fetch public web pages you
  name, such as your product's site.

When Merge & Tell writes drafts, it sends the pull request's title, description and
diff to Anthropic's Claude API. That happens on Merge & Tell's servers, under the
[privacy policy](https://merge.tel/legal/privacy), whether or not you use this plugin.

## The skills

- `merge-and-tell` walks an account through setup: connecting GitHub and social
  accounts, writing a voice, routing repositories, and queueing a first post.
- `merge-and-tell-icp` writes the reader (ICP, ideal customer profile) your posts are
  framed for, from a repository, a product site, or both, with a source for each field.

The skills are Markdown instructions. They call the MCP tools above and nothing else.

## Install and sign in

Claude Code:

```
claude plugin marketplace add mergetel/agents
claude plugin install merge-and-tell@mergetel
```

Then run `/mcp`, pick `plugin:merge-and-tell:merge-and-tell`, and choose
Authenticate.

Codex:

```
codex plugin marketplace add mergetel/agents
codex plugin add merge-and-tell@mergetel
codex mcp login merge-and-tell
```

Then ask your agent to "Set up Merge & Tell for me."

Support: john@merge.tel. Docs: https://merge.tel/docs/mcp.
