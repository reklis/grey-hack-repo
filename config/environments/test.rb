# frozen_string_literal: true

require "active_support/core_ext/integer/time"

# The test environment is used exclusively to run your application's
# test suite. You never need to work with it otherwise. Remember that
# your test database is "scratch space" for the test suite and is wiped
# and recreated between test runs. Don't rely on the data there!

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.
  # For E2E tests with Sidekiq, we need eager_load and cache_classes enabled
  # since Sidekiq runs as a separate process
  if ENV["SMTP_ADDRESS"].present?
    config.cache_classes = true
    config.eager_load = true
  else
    config.cache_classes = false
    config.eager_load = false
  end
  config.action_view.cache_template_loading = true

  config.log_level = :debug

  # Configure public file server for tests with Cache-Control for performance.
  config.public_file_server.enabled = true
  config.public_file_server.headers = {
    "Cache-Control" => "public, max-age=#{1.hour.to_i}"
  }

  # Show full error reports and disable caching.
  config.consider_all_requests_local = true
  config.action_controller.perform_caching = true
  config.session_store :cache_store

  # Raise exceptions instead of rendering exception templates.
  config.action_dispatch.show_exceptions = false

  # Disable request forgery protection in test environment.
  config.action_controller.allow_forgery_protection = false

  # Store uploaded files on the local file system in a temporary directory.
  config.active_storage.service = :test

  config.action_mailer.perform_caching = false

  # Use SMTP for E2E tests (Mailpit), otherwise use :test
  if ENV["SMTP_ADDRESS"].present?
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      address: ENV["SMTP_ADDRESS"],
      port: ENV.fetch("SMTP_PORT", 1025).to_i,
      domain: ENV.fetch("SMTP_DOMAIN", "localhost"),
      enable_starttls_auto: ENV["SMTP_STARTTLS"] == "true"
    }
    # Enable actual email delivery for E2E tests
    config.action_mailer.perform_deliveries = true
    config.action_mailer.raise_delivery_errors = true
    # Use Sidekiq for async email delivery in E2E tests
    config.active_job.queue_adapter = :sidekiq
  else
    # The :test delivery method accumulates sent emails in the
    # ActionMailer::Base.deliveries array.
    config.action_mailer.delivery_method = :test
    # Use inline adapter for unit tests to process jobs synchronously
    config.active_job.queue_adapter = :inline
  end

  # Print deprecation notices to the stderr.
  config.active_support.deprecation = :stderr

  # Raise exceptions for disallowed deprecations.
  config.active_support.disallowed_deprecation = :raise

  # Tell Active Support which deprecation messages to disallow.
  config.active_support.disallowed_deprecation_warnings = []

  # Raises error for missing translations.
  # config.i18n.raise_on_missing_translations = true

  # Annotate rendered view with file names.

  # config.action_controller.default_url_options = {host: "localhost", port: 3000}
  config.action_mailer.default_url_options = {host: "localhost", port: 3000} # config.action_view.annotate_rendered_view_with_filenames = true
end
