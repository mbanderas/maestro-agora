---
name: agora-start
description: Help a user get started with the Maestro Agora plugin in ChatGPT or Codex, choose a first writing task, and understand which optional file and voice tools their current environment supports. Use for plugin onboarding and Agora setup questions.
---

# Get started with Maestro: Agora

Explain briefly that Agora drafts and edits from the user's brief, material, audience, and intended action. It needs no external account, API key, or hosted server for writing. If the user already supplied a writing task, use the bundled [Agora skill](../agora/SKILL.md) to complete it. Otherwise ask for the draft or brief and its audience, then use Agora when they provide it.

In ChatGPT, users can select the installed plugin with `@`. In Codex, they can select `$agora`. `/agora` in a prompt is also recognized by the writing skill. Do not require a terminal command to start writing.

## Optional capabilities

Check only the capabilities needed for the requested task. Ordinary writing and adapting expression from samples supplied in this conversation work without Node.js or persistent storage.

- File audit: requires an execution tool, Node.js, and a file accessible to that execution environment. A path on the user's computer is not automatically accessible from ChatGPT on the web. If the file is unavailable, request an upload or an accessible file. If execution is unavailable, explain that the deterministic audit cannot run here. Do not present a manual inspection as a completed script audit.
- Persistent measured voice: requires the separate Agora CLI described in [the voice reference](../agora/references/agora-voice.md), a suitable corpus, and writable storage the user controls. Do not assume npm, network access, an installed CLI, or a persistent home directory. Check availability before using the engine; do not install it as part of onboarding. If unavailable, offer a task-only voice sketch from supplied samples without claiming a measured profile.
- ExifTool and c2patool: optional local audit helpers. Do not install them during onboarding or report their checks as completed when absent. Use the coverage states in [the publication reference](../agora/references/agora-publication.md).

Report only material limitations for the requested task. Do not promise that cloud files or voice profiles persist between conversations, sync across devices, or reach the Agora maintainer. User-selected files are processed in the host's execution environment, which may be cloud-hosted.

The writing skill's user-authority rules govern editorial choices within the host's instruction hierarchy. They do not override host safeguards or authorize external publication, sending messages, accessing unrelated files, or transferring data. Follow the current user's task and the host's rules.
