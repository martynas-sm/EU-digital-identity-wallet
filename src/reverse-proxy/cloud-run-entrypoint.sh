#!/bin/sh
set -e
# Generate the config
envsubst '$DOMAIN_SUFFIX' < /etc/nginx/conf.d/cloud-run-nginx.conf.template > /etc/nginx/conf.d/cloud-run-nginx.conf
# Remove the template and the default config which causes conflicts
rm -f /etc/nginx/conf.d/cloud-run-nginx.conf.template
rm -f /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
