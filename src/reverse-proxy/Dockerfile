FROM public.ecr.aws/docker/library/nginx:alpine

COPY dns.conf.template /etc/nginx/conf.d/
COPY cloud-run-nginx.conf.template /etc/nginx/conf.d/
COPY docker-entrypoint.sh /
COPY cloud-run-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
