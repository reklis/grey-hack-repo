# frozen_string_literal: true

Sentry.init do |config|
  config.dsn = "https://fe8719ca1abbd07fce807865597bf8b6@o4510602766123008.ingest.us.sentry.io/4510602767368192"
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]

  # Add data like request headers and IP for users,
  # see https://docs.sentry.io/platforms/ruby/data-management/data-collected/ for more info
  config.send_default_pii = true
end
