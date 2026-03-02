FROM redis:6-alpine

# Install OpenSSH server for the SSH key injection attack chain (Step 4)
RUN apk add --no-cache openssh-server bash

# INTENTIONAL MISCONFIGURATION: permit root login via pubkey only
# Players write their SSH public key to /root/.ssh/authorized_keys using:
#   redis-cli CONFIG SET dir /root/.ssh
#   redis-cli CONFIG SET dbfilename authorized_keys
#   redis-cli SET crackit "\n\n<pubkey>\n\n"
#   redis-cli SAVE
# Then SSH in: ssh -i <privkey> -p 2222 root@<HOST_IP>
RUN echo "PermitRootLogin yes"          >> /etc/ssh/sshd_config && \
    echo "PasswordAuthentication no"    >> /etc/ssh/sshd_config && \
    echo "PubkeyAuthentication yes"     >> /etc/ssh/sshd_config && \
    echo "StrictModes no"               >> /etc/ssh/sshd_config && \
    mkdir -p /root/.ssh && \
    chmod 700 /root/.ssh

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 6379 22

ENTRYPOINT ["/entrypoint.sh"]
