FROM rustfs/rustfs:1.0.6

# Refresh Alpine security packages without changing the runtime user.
USER root
RUN apk upgrade --no-cache
USER rustfs
