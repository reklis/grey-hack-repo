FROM axllent/mailpit:v1.34.0

# Refresh Alpine security packages between upstream image rebuilds.
RUN apk upgrade --no-cache
