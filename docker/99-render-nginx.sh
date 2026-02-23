#!/bin/sh
set -eu

api_upstream="${API_UPSTREAM:-https://discovery-datafarm.com.au:8081}"
api_upstream="${api_upstream%/}"

sed "s|__API_UPSTREAM__|${api_upstream}|g" \
  /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf
