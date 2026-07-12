#!/bin/bash
MEM_LIMIT_KB=$1
shift

ulimit -v "$MEM_LIMIT_KB"
ulimit -u 64
ulimit -f 10240

exec "$@"

