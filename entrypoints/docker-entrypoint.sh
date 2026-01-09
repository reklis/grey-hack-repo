#!/bin/sh

set -e

if [ -f tmp/pids/server.pid ]; then
  rm tmp/pids/server.pid
fi

# Wait for database to be ready for connections
echo "Waiting for database..."
MAX_RETRIES=30
RETRY_COUNT=0
until bundle exec rails runner "ActiveRecord::Base.connection" 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "Failed to connect to database after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "Database not ready, retrying in 2 seconds... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done
echo "Database connection established"

bundle exec rails db:prepare
bundle exec rails db:migrate

# Execute the command passed to the container (or default to Rails server)
if [ $# -gt 0 ]; then
  exec "$@"
else
  exec bundle exec rails s -b 0.0.0.0
fi
