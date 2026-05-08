#!/bin/sh
set -e
# Replace the default nginx conf with our cloud run conf
cp /etc/nginx/conf.d/cloud-run-nginx.conf /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
