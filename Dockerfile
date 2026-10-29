FROM ruby:4.0.9-slim-trixie AS base

WORKDIR /rails

# Set production environment
ENV RAILS_ENV="production" \
    BUNDLE_WITHOUT="development:test" \
    BUNDLE_DEPLOYMENT="1"

# Patch OS packages and default gems, including gems outside Bundler's lockfile.
COPY bin/patch-default-gems ./bin/patch-default-gems
RUN apt-get update -qq && \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends -y build-essential && \
    gem update --system 4.0.23 --no-document && \
    ./bin/patch-default-gems && \
    apt-get purge -y --auto-remove build-essential && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential curl git libpq-dev libvips libyaml-dev node-gyp pkg-config python-is-python3

ARG NODE_VERSION=24.22.2
ARG YARN_VERSION=1.22.22
ENV PATH=/usr/local/node/bin:$PATH
# Verify the official binary instead of relying on node-build's moving definitions.
RUN arch="$(dpkg --print-architecture)" && \
    case "$arch" in amd64) arch=x64 ;; arm64) ;; *) exit 1 ;; esac && \
    cd /tmp && \
    curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt" && \
    curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${arch}.tar.xz" && \
    grep " node-v${NODE_VERSION}-linux-${arch}.tar.xz\$" SHASUMS256.txt | sha256sum -c - && \
    mkdir -p /usr/local/node && \
    tar -xJf "node-v${NODE_VERSION}-linux-${arch}.tar.xz" -C /usr/local/node --strip-components=1 && \
    npm install -g yarn@${YARN_VERSION} && \
    rm -f /tmp/SHASUMS256.txt /tmp/node-v*.tar.xz

COPY Gemfile Gemfile.lock ./
RUN bundle install && \
    rm -rf ~/.bundle/ $BUNDLE_PATH/ruby/*/cache $BUNDLE_PATH/ruby/*/bundler/gems/*/.git

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Download wordlist from external storage (too large for git).
# Keep this independent of application changes so rebuilds reuse the download.
RUN mkdir -p wordlists && \
    curl -fL -o wordlists/precomputed_hashes.txt "https://greyhackrepo.us-iad-10.linodeobjects.com/wordlists%2Fprecomputed_hashes.txt"

COPY . .

RUN SECRET_KEY_BASE=DUMMY ./bin/rails assets:precompile && \
    rm -rf node_modules

# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends -y curl imagemagick libvips postgresql-client && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built artifacts: gems, application
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /rails .

EXPOSE 3000

ENTRYPOINT ["./entrypoints/docker-entrypoint.sh"]
