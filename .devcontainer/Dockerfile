FROM mcr.microsoft.com/devcontainers/ruby:4.1.5-4.0-trixie

# Keep OS packages patched; application gems are installed from Gemfile.lock.
COPY bin/patch-default-gems /usr/local/bin/patch-default-gems
RUN apt-get update -qq && \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends -y libpq-dev libvips libyaml-dev && \
    gem update --system 4.0.23 --no-document && \
    /usr/local/bin/patch-default-gems && \
    ruby -e 'abort "Ruby 4.0.9 or newer stable 4.0.x required" unless RUBY_VERSION.start_with?("4.0.") && Gem::Version.new(RUBY_VERSION) >= Gem::Version.new("4.0.9") && RUBY_PATCHLEVEL >= 0' && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV RAILS_DEVELOPMENT_HOSTS=".githubpreview.dev,.app.github.dev"

ARG NODE_VERSION="24.22.2"
RUN su vscode -c ". /usr/local/share/nvm/nvm.sh && nvm install ${NODE_VERSION} && nvm alias default ${NODE_VERSION} && npm install -g yarn@1.22.22"
