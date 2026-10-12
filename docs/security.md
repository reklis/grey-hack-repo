# Container vulnerability maintenance

The production image contains precompiled assets, not `node_modules` or Node.js.
Keep frontend dependencies patched anyway: their browser code is bundled into
those assets. Ruby default gems must also be patched separately from Bundler.

CI builds and boots the production image, scans it with Trivy, and only publishes
it when there are **no findings with an available fix**, at any severity. The
`image-vulnerabilities` artifact includes the full report, including unfixed
findings. No CVEs are allowlisted or suppressed.

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
```

Also scan `Gemfile.lock` and `yarn.lock` with `trivy fs --scanners vuln .` to
check development dependencies that are intentionally absent from production.

## Remaining upstream findings

Debian trixie still reports vulnerabilities without a published fixed package.
In particular, the October 2026 scan identifies critical findings in OpenEXR
(`CVE-2026-42216`, `CVE-2026-42217`) and libxml2 (`CVE-2026-6653`). These packages
are image-processing dependencies. Updating to the latest Debian packages does
not eliminate those findings. Do not describe the image as CVE-free; rebuild
and rescan as upstream fixes become available.

JSON stays on the patched 2.x series because Sprockets 4 uses `create_additions`,
which JSON 3 removed. The production boot check catches this incompatibility;
asset precompilation alone does not.

Web and Sidekiq share the application image, so deploy both, including the web
migration init container. The PostgreSQL and Redis wait containers should use
BusyBox 1.37 rather than 1.36. Deployment manifests live in the separate
`lab-operations` repository under `k8s/greyrepo.xyz/`.
