# frozen_string_literal: true

# Sidekiq uses Redis db 1 (cache uses db 0)
SIDEKIQ_REDIS_URL = ENV.fetch("REDIS_SIDEKIQ_URL", "redis://localhost:6379/1")

Sidekiq.configure_server do |config|
  config.redis = {url: SIDEKIQ_REDIS_URL}
end

Sidekiq.configure_client do |config|
  config.redis = {url: SIDEKIQ_REDIS_URL}
end
