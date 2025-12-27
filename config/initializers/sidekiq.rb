# frozen_string_literal: true

# Sidekiq uses Redis db 1 (cache uses db 0)
SIDEKIQ_REDIS_URL = ENV.fetch("REDIS_SIDEKIQ_URL", "redis://localhost:6379/1")

SIDEKIQ_REDIS_CONFIG = {
  url: SIDEKIQ_REDIS_URL,
  reconnect_attempts: 3,
  timeout: 5,
  connect_timeout: 2
}.freeze

Sidekiq.configure_server do |config|
  config.redis = SIDEKIQ_REDIS_CONFIG
end

Sidekiq.configure_client do |config|
  config.redis = SIDEKIQ_REDIS_CONFIG
end
