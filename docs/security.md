# Container vulnerability maintenance

The production image contains precompiled assets, not `node_modules` or Node.js.
Keep frontend dependencies patched anyway: their browser code is bundled into
those assets. Ruby default gems must also be patched separately from Bundler.

CI audits all lockfiles (including development dependencies), builds and boots
the production image on pushes and pull requests, and rejects **all findings
with an available fix**, at any severity, before publishing on master. It also
builds and scans the patched Compose PostgreSQL image, publishing it on master
as `ghcr.io/reklis/grey-hack-repo:postgres-18.6-<full-commit-sha>` for production
use. Reports are uploaded as workflow artifacts. No CVEs are allowlisted or
suppressed.

## Reproduce the checks

```sh
docker build --pull -t greyrepo:security .
docker run --rm --entrypoint bundle \
  -e SECRET_KEY_BASE=security-build-check -e ACTIVE_STORAGE_SERVICE=local \
  greyrepo:security exec rails zeitwerk:check

docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD:/reports" \
  aquasec/trivy:0.75.0 image --image-src docker --scanners vuln \
  --format json --output /reports/trivy.json greyrepo:security
jq -e '[.Results[]?.Vulnerabilities[]? | select((.FixedVersion // "") != "")] | length == 0' trivy.json

# Lockfiles, including packages deliberately absent from production:
docker run --rm -v "$PWD:/src:ro" -v "$PWD:/reports" \
  aquasec/trivy:0.75.0 fs --scanners vuln --include-dev-deps \
  --skip-dirs .git --skip-dirs node_modules --skip-dirs tmp --skip-dirs coverage \
  --format json --output /reports/dependencies.json /src
jq -e '[.Results[]?.Vulnerabilities[]? | select((.FixedVersion // "") != "")] | length == 0' dependencies.json

# Compose PostgreSQL (not the unmodified upstream image):
docker build --pull -f docker/postgres.Dockerfile -t greyrepo-postgres:18.6-security .
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$PWD:/reports" aquasec/trivy:0.75.0 image --image-src docker \
  --scanners vuln --format json --output /reports/trivy-postgres.json \
  greyrepo-postgres:18.6-security
```

Pull and scan the other Compose images separately; an application-image scan
does not cover PostgreSQL, Redis, RustFS, Mailpit, or the bucket initializer.
Rebuild with `--pull --no-cache` to force fresh OS packages even if the base tag
has not changed. Dependabot tracks gems, both Yarn projects, Docker/Compose
images, and GitHub Actions.

## Audit snapshot: 2026-10-29 (UTC)

Trivy 0.75.0, vulnerability database updated 2026-10-28 19:18 UTC, linux/amd64.
Counts below are package/advisory findings, **not unique CVE counts**.
Full local JSON reports and check logs are in `tmp/security/` (not committed).
The Ruby 4 follow-up reports are in `tmp/security/ruby4/`; the final production
scan is `image-patched.json`.

| Scope | Findings | With an available fix |
| --- | ---: | ---: |
| Previous application image (`greyrepo-security:release`) | 1,143 | 78 |
| First security rebuild (Ruby 3.3.13) | 1,065 | **0** |
| Final Ruby 4.0.9 application image | 1,065 | **0** |
| All four lockfiles, including dev/test and Cargo | **0** | **0** |
| Patched Compose PostgreSQL 18.6 | **0** | **0** |
| Redis 8.10.2 Alpine (initial audit) | **0** | **0** |
| Redis 8.10.3 Alpine (datastore upgrade) | **0** | **0** |
| RustFS 1.0.4 (musl, not `-glibc`) | **0** | **0** |
| AWS CLI 2.39.1 bucket initializer | **0** | **0** |
| Mailpit 1.32.0 | 3 | **2** |

The runtime is now **Ruby 4.0.9 and Rails 8.1.4**, verified as the latest stable
releases on 2026-10-29. Ruby's upstream release is explicitly not a prerelease;
Rails' stable versions API also reports 8.1.4. Docker, the devcontainer, CI,
`.tool-versions`, and Gemfile agree. CI rejects prerelease Ruby and locked gems.
Faker now uses stable 3.8.0 from RubyGems, not Git `main`.

Other changes include Bundler/RubyGems 4.0.23, PgHero 3.7.0 → 4.1.0,
ViewComponent 4.12.0 → 4.20.0, Crass 1.0.7 → 1.0.8, and Vite 7.3.6 → 7.3.7.
Rails was already current and is constrained to its patched minor series rather
than any Rails major. Rails browser packages match Rails 8.1.
StimulusReflex/CableReady gem and npm versions remain paired. Node 24.22.2 is
used only during production builds.

The PostgreSQL derivative updates Alpine libraries and replaces the vulnerable
Go-built `gosu` helper with Alpine `su-exec`, preserving the entrypoint's drop to
the `postgres` user. The unmodified upstream PostgreSQL image still had 86
fixable findings; **CI's disposable database service uses that upstream image**,
not the local derivative. RustFS's glibc variant still had 15 fixable findings,
including its bundled Pebble helper; the tested musl variant avoids these.
The retired MinIO client image is replaced with AWS CLI. Bucket creation is
idempotent and now fails on setup errors instead of always returning success.

### Remaining findings and limitations

The application still has 3 critical, 159 high, 324 medium, 550 low and 29
unknown-severity Debian findings without a published fixed package. Critical
findings are OpenEXR `CVE-2026-42216` / `CVE-2026-42217` and libxml2
`CVE-2026-6653`, pulled in by image processing. Do not describe the image as
CVE-free. Rebuild and rescan as Debian fixes become available.

Mailpit's latest stable image embeds `golang.org/x/net` 0.61.0, affected by
`CVE-2026-78661` and `CVE-2026-97045` (fixed in 0.62.0), plus the unmaintained
OpenPGP advisory `GO-2026-5932` without a fix. These remain unresolved pending an
upstream rebuild; Mailpit is a local/CI email-testing service, not an application
runtime dependency. Do not expose it publicly.

The Ruby 4.0.9 devcontainer builds successfully, but its complete OS/tool image
was not CVE-audited. Devbox's Ruby catalog only offered 4.0.7, not 4.0.9. The old
Ruby 3.3 package has been removed from `devbox.json` and `devbox.lock`; Devbox
now provides native libraries/tools only. Install `.tool-versions` first, or use
Docker/the devcontainer for a managed Ruby runtime.

Ruby 4.0.9 ships vulnerable JSON 2.18.0 even though the app bundle uses 2.21.2.
The shared `bin/patch-default-gems` helper installs patched JSON, resolver and
IMAP gems outside Bundler in both Dockerfiles, and removes the vulnerable default
JSON specification **and its Ruby/native code**. This fixes `CVE-2026-33210` and
`CVE-2026-54696`; merely updating Gemfile.lock would leave them in the image.
CI checks JSON outside Bundler as well as the bundled runtime.

JSON stays on patched 2.x because Sprockets 4 uses `create_additions`, removed in
JSON 3. Production boot checks catch this incompatibility; asset compilation
alone does not. Existing `config.load_defaults 6.1` behavior is retained for
compatibility; changing those defaults is a separate migration, not a change to
the installed Rails 8.1.4 release.

## Validation

- Production image builds and precompiles assets; Zeitwerk/boot and the loaded
  resolver (0.8.1) checks pass on Ruby 4.0.9 / Rails 8.1.4.
- Patched JSON 2.21.2, resolver 0.8.1 and IMAP 0.6.8 load outside Bundler in
  both production and development images; vulnerable JSON default code is gone.
- StandardRB on Ruby 4: 347 files, no offenses.
- Full Playwright Chromium suite on Ruby 4: **101 passed**, 0 failures, 0 skipped,
  across 14 files in 4.3 minutes, with retries disabled. Run against a fresh,
  isolated production Compose stack using the final patched Ruby 4.0.9 image.
  HTML report: `tmp/playwright-full/html/index.html`; JUnit:
  `tmp/playwright-full/junit.xml`; log: `tmp/playwright-full/run.log`.
  Disposable test containers and volumes were removed afterward.
- PostgreSQL fresh initialization, non-root server execution, and repeated S3
  bucket initialization pass. Web and Sidekiq boot against the patched stack.
- Full Ruby 4 suite: 203 runs, 462 assertions, 33 failures and 2 errors, the
  **same 35 failing tests** and counts as the earlier Ruby 3.3 baseline and the
  original Gemfile/lockfile run. No new failing tests, but this is not a green
  suite. The errors include job assertions requiring the test adapter while
  test configuration uses inline.
- Both Compose configurations and the CI/Dependabot YAML validate.

Existing Compose entrypoints both prepare/migrate the database. Starting web and
Sidekiq together on an empty database can race schema initialization (observed
during the smoke run); initialize the database once before scaling workers.

## Rollout precautions

These changes do not deploy or modify existing production containers or data.
Back up databases and object storage before upgrades. Older devcontainer
PostgreSQL volumes require `pg_upgrade` or dump/restore into a fresh PostgreSQL
18 volume; do not simply attach an older-major data directory to this image.
Back up and test RustFS beta-to-stable storage upgrades separately. Compose
credentials and the secret key are local-test defaults, not production secrets.

Web and Sidekiq share the application image, so deploy both, including the web
migration init container. The PostgreSQL and Redis wait containers should use
BusyBox 1.37 rather than 1.36. Deployment manifests live in the separate
`lab-operations` repository under `k8s/greyrepo.xyz/`; they were not changed here.
