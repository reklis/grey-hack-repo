FROM postgres:18.6-alpine3.24

# Patch distro libraries and replace the stale Go-based gosu binary with
# Alpine's su-exec. Both exec the entrypoint as postgres without a supervisor.
RUN apk upgrade --no-cache && \
    apk add --no-cache su-exec && \
    grep -q 'exec gosu postgres' /usr/local/bin/docker-entrypoint.sh && \
    sed -i 's/exec gosu postgres/exec su-exec postgres/' /usr/local/bin/docker-entrypoint.sh && \
    rm /usr/local/bin/gosu
