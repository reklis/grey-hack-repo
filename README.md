![Grey Repo Banner](https://i.imgur.com/ywT99ea.png)

# Grey Repo

A community-driven scripts repository for the [Grey Hack](https://store.steampowered.com/app/605230/Grey_Hack/) game. Share, discover, and collaborate on GreyScript code with fellow hackers.

**Live Site:** https://www.greyrepo.xyz

## Features

- **Posts & Builds** - Create script collections with versioned builds and file trees
- **Gists** - Quick-share code snippets (supports anonymous posting)
- **Guilds** - Form teams with alignment system (white/grey/black hat)
- **Real-time Updates** - Live interactions powered by StimulusReflex
- **Code Editor** - Syntax highlighting and in-browser editing with CodeJar
- **Export to Game** - LZW compression for importing scripts into Grey Hack
- **Categories & Search** - Browse and discover scripts by category
- **Stars & Comments** - Engage with the community
- **User Profiles** - Track your contributions and showcase your work
- **Utility Tools** - NPC Decipher and Compressor tools for in-game assistance

## Tech Stack

### Backend
- **Ruby on Rails 8** - Web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching, sessions, and ActionCable
- **Sidekiq** - Background job processing
- **Devise** - Authentication
- **Pundit** - Authorization policies
- **Dry::Transaction** - Business logic orchestration
- **Active Storage + MinIO/S3** - File attachments

### Frontend
- **Vite** - Asset bundling
- **TailwindCSS + DaisyUI** - Styling
- **StimulusReflex + CableReady** - Real-time WebSocket updates
- **ViewComponent** - Component-based UI (40+ components)
- **Hotwire (Turbo + Stimulus)** - SPA-like interactions
- **CodeJar + highlight.js** - Code editing and syntax highlighting

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **GitHub Container Registry** - Docker image hosting
- **Devbox** - Reproducible development environment

## Requirements

- Ruby 3.3.x
- PostgreSQL 14+
- Redis 7+
- Node.js 20+
- Yarn or npm

## Quick Start with Docker

The fastest way to run Grey Repo locally:

```bash
# Clone the repository
git clone https://github.com/your-org/greyrepo.xyz.git
cd greyrepo.xyz

# Start all services
docker compose up -d

# Access the application
open http://localhost:3000
```

This starts:
- **Web app** on port 3000
- **Sidekiq** for background jobs
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **MinIO** (S3-compatible storage) on ports 9000/9001
- **Mailpit** (email testing) on port 8025

## Development Setup

### Option 1: Using Devbox (Recommended)

```bash
# Install devbox
curl -fsSL https://get.jetify.com/devbox | bash

# Start the development shell
devbox shell

# Install dependencies
bundle install
npm install

# Setup database
rails db:create && rails db:migrate && rails db:seed

# Start development servers
bin/dev
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   bundle install
   npm install
   ```

2. **Start PostgreSQL and Redis:**
   ```bash
   # Using Docker
   docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
   docker run -d --name redis -p 6379:6379 redis:8-alpine
   ```

3. **Configure database:**
   ```bash
   # Copy and edit database config
   cp config/database.yml.example config/database.yml

   # Create and setup database
   rails db:create && rails db:migrate && rails db:seed
   ```

4. **Start development servers:**
   ```bash
   # Runs Rails server + Vite dev server
   bin/dev

   # Or run individually:
   bin/rails server -p 3000
   bin/vite dev
   ```

5. **Optional - Start Sidekiq:**
   ```bash
   bundle exec sidekiq -C config/sidekiq.yml
   ```

Visit http://localhost:3000 to access the application.

## Testing

### Unit Tests

```bash
rails test
```

### End-to-End Tests (Playwright)

Grey Repo uses Playwright for comprehensive E2E testing covering authentication, posts, gists, guilds, and more.

```bash
cd e2e

# Install dependencies and browsers
npm install
npx playwright install --with-deps chromium

# Run tests (requires running Rails server)
npm test

# Run with browser visible
npm run test:headed

# Run specific test suite
npm run test:auth
npm run test:posts
npm run test:gists
npm run test:guilds

# Interactive UI mode
npm run test:ui

# Debug mode
npm run test:debug

# View test report
npm run report
```

### Linting

```bash
# Ruby linting with StandardRB
bundle exec standardrb --fix .

# Ensure frozen string literals
bundle exec magic_frozen_string_literal .
```

## Architecture

### Domain Models

```
Post (script collection)
├── Build (versioned release)
│   ├── Script (code file)
│   └── Folder (directory)
│       ├── Script
│       └── Folder (nested)
└── Comments
└── Stars

Gist (quick-share snippet)
├── Script(s)
└── Can be anonymous

Guild (team/organization)
├── Members
├── Invites
├── Announcements
└── Alignment (white/grey/black)

User
├── Posts
├── Gists
├── Guild memberships
├── Stars
└── Supporter badge
```

### Key Patterns

**Fileable Concern** (`app/models/concerns/fileable.rb`)
Shared behavior for Build, Folder, and Gist providing:
- Recursive file tree navigation
- Deep cloning via Amoeba gem
- Export/import serialization
- Path resolution

**GreyParser** (`app/models/grey_parser/`)
Custom LZW compression + base64 encoding for exporting scripts to Grey Hack game format:
- `encoder.rb` - Binary encoding/decoding
- `compressor.rb` - LZW compression
- `lzw.rb` - LZW algorithm implementation

**ViewComponent + Reflex Pairing**
Components often have paired Reflex classes for real-time updates:
- `StarsBadge` + `StarsBadgeReflex`
- `FileableExplorer` + `FileableExplorerReflex`
- `BuildSelector` + `BuildSelectorReflex`

**Dry::Transaction**
Business logic orchestration for complex workflows:
- `Builds::AfterUpdate` - Post-build processing
- `Invites::Create` - Guild invitation workflow

### Directory Structure

```
app/
├── components/     # ViewComponents (40+ components)
├── controllers/    # Rails controllers
├── helpers/        # View helpers
├── javascript/
│   └── controllers/  # Stimulus controllers
├── jobs/           # Sidekiq background jobs
├── mailers/        # Email templates
├── models/
│   ├── concerns/   # Shared model behavior
│   └── grey_parser/  # Script encoding utilities
├── notifiers/      # Noticed notification definitions
├── policies/       # Pundit authorization policies
├── reflexes/       # StimulusReflex controllers
├── transactions/   # Dry::Transaction workflows
└── views/          # ERB templates

config/             # Rails configuration
db/                 # Migrations and schema
e2e/                # Playwright E2E tests
lib/                # Library code and rake tasks
public/             # Static assets
```

## Deployment

### Docker Deployment

```bash
# Build the image
docker build -t greyrepo .

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=postgres://user:pass@host:5432/db \
  -e REDIS_URL=redis://host:6379 \
  -e SECRET_KEY_BASE=your-secret-key \
  greyrepo
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `REDIS_CACHE_URL` | Redis URL for caching |
| `REDIS_SIDEKIQ_URL` | Redis URL for Sidekiq |
| `SECRET_KEY_BASE` | Rails secret key |
| `ACTIVE_STORAGE_SERVICE` | Storage backend (local/minio/amazon) |
| `MINIO_ENDPOINT` | MinIO/S3 endpoint URL |
| `APP_HOST` | Application hostname |
| `SMTP_ADDRESS` | Mail server address |
| `SMTP_PORT` | Mail server port |
| `SMTP_DOMAIN` | Mail domain |

### CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`):
1. Runs Playwright E2E tests on every push/PR
2. Builds and pushes Docker image to GHCR on master branch

## Database Operations

```bash
# Create database
rails db:create

# Run migrations
rails db:migrate

# Seed initial data
rails db:seed

# Full setup
rails db:prepare

# Backup database
PGPASSWORD=PASSWORD pg_dump -F c -v -h HOSTNAME -U USERNAME -p PORT -d DATABASE -f backup.psql

# Restore database
PGPASSWORD=PASSWORD pg_restore -c -C -F c -v -U USERNAME -h HOSTNAME -p PORT -d DATABASE backup.psql
```

## Admin Tools

Authenticated admin users have access to:

- **PgHero** (`/pghero`) - PostgreSQL performance monitoring
- **Sidekiq Web** (`/sidekiq`) - Background job monitoring
- **Blazer** (`/blazer`) - SQL queries and dashboards

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`rails test && cd e2e && npm test`)
4. Run linters (`bundle exec standardrb --fix .`)
5. Commit your changes
6. Push to the branch
7. Open a Pull Request

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
