#!/bin/sh
# Entrypoint for CipherOps Redis container
#
# LAB CONFIG: Starts OpenSSH daemon first so that the Redis-to-root SSH key
# injection technique works. After polluting /root/.ssh/authorized_keys via
# the Redis SAVE trick, an attacker can SSH to this container on port 22
# (mapped to host port 2222) as root without a password.

# Generate SSH host keys if not already present
if [ ! -f /etc/ssh/ssh_host_rsa_key ]; then
    ssh-keygen -A
fi

# Start sshd explicitly in the background so exec can hand off to Redis.
# Using -D would block here forever; backgrounding lets both processes run.
/usr/sbin/sshd -D &

# Hand off to Redis (PID 1)
exec redis-server /usr/local/etc/redis/redis.conf "$@"
