# frozen_string_literal: true

source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "~> 3.3.0"

gem "rails", ">= 8.0"
# Pin connection_pool to 2.x due to incompatibility with Rails 8.1.1 redis_cache_store
# See: https://github.com/mperham/connection_pool/issues/210
gem "connection_pool", "~> 2.4"

gem "pg"
gem "puma"
gem "turbo-rails"
gem "jbuilder"
# Use Active Storage variant
gem "image_processing"
# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false
# Active storage provider
gem "aws-sdk-s3"
# Stimulus Reflex
gem "redis"
gem "hiredis-client"
gem "redis-session-store" # removing this causes sentry params filter to break even though redis session store is disabled
gem "stimulus_reflex"
gem "cable_ready"
# front end gems
gem "view_component-form"
gem "view_component"
gem "simple_form"
gem "meta-tags"
gem "octicons_helper"
gem "pagy", "~> 9.0"
gem "diffy"
gem "local_time"
gem "futurism"
# back end gems
gem "ahoy_matey"
gem "blazer"
gem "clockwork"
gem "dry-transaction"
gem "pundit"
gem "pghero"
gem "redcarpet"
gem "amoeba"
gem "discord-notifier"
gem "sidekiq"
gem "devise"
gem "noticed"
gem "friendly_id"
gem "rubyzip", require: "zip" # required by FileJob
gem "pay"
# assets bundling
gem "sprockets-rails"
gem "vite_rails"
# apm provider
gem "stackprof"
gem "sentry-ruby"
gem "sentry-rails"
gem "sentry-sidekiq"

gem "foreman", require: false

group :development, :test do
  gem "debug"
  gem "factory_bot_rails"
  gem "faker", git: "https://github.com/faker-ruby/faker.git", branch: "main"
  gem "rails-controller-testing"
  gem "simplecov"
end

group :development do
  gem "web-console"
  gem "rack-mini-profiler"
  gem "listen"
  gem "spring"
  gem "standardrb"
  gem "rubocop"
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
  gem "webdrivers"
end

gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]
