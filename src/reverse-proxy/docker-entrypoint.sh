#!/bin/sh
set -e
envsubst '$DOMAIN_SUFFIX' < /etc/nginx/conf.d/dns.conf.template > /etc/nginx/conf.d/dns.conf
exec nginx -g 'daemon off;'
