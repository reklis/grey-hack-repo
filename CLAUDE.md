# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Grey Repo is a Ruby on Rails 7 web application for sharing scripts for the GreyHack game. It features real-time interactivity via StimulusReflex, component-based UI with ViewComponents, and TailwindCSS/DaisyUI styling.

**Live site:** https://www.greyrepo.xyz

## Development Commands

```bash
# Start development server (runs Rails + Vite)
bin/dev

# Or run individually:
bin/rails server -p 3000
bin/vite dev

# Run tests
rails test

# Run linters
bundle exec standardrb --fix .
bundle exec magic_frozen_string_literal .

# Database setup
rails db:create && rails db:migrate && rails db:seed
```

## Requirements

- Ruby 3.2.x
- PostgreSQL
- Redis
- Node.js (for Vite)

## Architecture

### Core Domain Models

- **Post** - Script collection/project with nested Builds
- **Build** - Version of a post with file tree (uses Fileable concern)
- **Script** - Individual script file (polymorphic: Build, Folder, or Gist)
- **Folder** - Hierarchical file organization (polymorphic)
- **Gist** - Quick-share code snippets (can be anonymous)
- **Guild** - Team/organization with members and alignment (white/grey/black)
- **User** - Devise auth with GitHub OAuth and Stripe payment support

### Key Patterns

**Fileable Concern** (`app/models/concerns/fileable.rb`): Shared behavior for Build, Folder, and Gist providing recursive file tree navigation, deep cloning via amoeba, and export/import serialization.

**GreyParser** (`app/lib/grey_parser.rb`): LZW compression + base64 encoding for exporting scripts to GreyHack game format.

**ViewComponent + Reflex Pairing**: Components often have paired Reflex classes for real-time updates:
- `StarsBadge` + `StarsBadgeReflex`
- `FileableExplorer` + `FileableExplorerReflex`
- `BuildSelector` + `BuildSelectorReflex`
- `CommentsForm::Component` + `CommentsForm::ComponentReflex`

**Dry::Transaction** (`app/transactions/`): Business logic orchestration for complex workflows like `Builds::AfterUpdate` and `Invites::Create`.

### Frontend Stack

- **Vite** for asset bundling
- **TailwindCSS + DaisyUI** for styling
- **StimulusReflex** (v3.5.0-rc4) for real-time interactivity
- **CableReady** for WebSocket-driven DOM updates
- **CodeJar** for code editor
- **highlight.js** for syntax highlighting

### Key Directories

- `app/components/` - ViewComponents (40+ components)
- `app/reflexes/` - StimulusReflex controllers
- `app/javascript/controllers/` - Stimulus controllers
- `app/transactions/` - Dry::Transaction business logic
- `app/lib/` - Custom libraries (GreyParser, etc.)

### Authorization

Uses Pundit for policy-based authorization. Policies in `app/policies/`.

### Background Jobs

Sidekiq processes jobs for file generation (ZIP bundles), Discord notifications, and NFT webhooks.
