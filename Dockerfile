FROM ruby:3.3.12-slim-trixie AS base

WORKDIR /rails

# Set production environment
ENV RAILS_ENV="production" \
    BUNDLE_WITHOUT="development:test" \
    BUNDLE_DEPLOYMENT="1"

# Patch OS packages and default gems, including gems outside Bundler's lockfile.
RUN apt-get update -qq && \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends -y build-essential && \
    gem update --system --no-document && \
    gem install -N bundler erb:6.0.7 net-imap:0.6.8 resolv:0.7.2 && \
    rm -f /usr/local/lib/ruby/gems/3.3.0/specifications/default/erb-4.*.gemspec \
          /usr/local/lib/ruby/gems/3.3.0/specifications/net-imap-0.4.*.gemspec \
          /usr/local/lib/ruby/gems/3.3.0/specifications/default/resolv-0.3.*.gemspec && \
    rm -rf /usr/local/lib/ruby/3.3.0/erb.rb /usr/local/lib/ruby/3.3.0/erb \
           /usr/local/lib/ruby/3.3.0/resolv.rb \
           /usr/local/lib/ruby/gems/3.3.0/gems/net-imap-0.4.* && \
    apt-get purge -y --auto-remove build-essential && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential curl git libpq-dev libvips libyaml-dev node-gyp pkg-config python-is-python3

ARG NODE_VERSION=24.21.0
ARG YARN_VERSION=1.22.22
ENV PATH=/usr/local/node/bin:$PATH
RUN curl -sL https://github.com/nodenv/node-build/archive/master.tar.gz | tar xz -C /tmp/ && \
    /tmp/node-build-master/bin/node-build "${NODE_VERSION}" /usr/local/node && \
    npm install -g yarn@$YARN_VERSION && \
    rm -rf /tmp/node-build-master

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
