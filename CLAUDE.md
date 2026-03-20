# Faroese Radio

The goal is to build a comprehensive historical record of every song played on Faroese radio stations.

## CRITICAL RULES

- NEVER write to the database without being explicitly told. This includes applying migrations (`apply_migration`), executing SQL (`execute_sql`), or any other MCP tool that modifies database state. Creating migration _files_ is fine — applying them is not.

## Working with this codebase

- Double-check assumptions by reading the actual code before making changes.
- If in doubt, ask rather than guess.
- Make atomic changes, one commit at the time.
- I prefer to work from branches. Don't push to main without me telling you.
- Think critically about existing conventions. It's fine to switch things around.
