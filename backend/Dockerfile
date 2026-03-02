FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

# Create flag2 file – only readable after achieving RCE (not exposed via any API endpoint)
# The startup-script.sh overwrites this with the real flag at runtime on GCP.
RUN mkdir -p /var/www && \
    echo "VulnOs{pr0t0_p0llut10n_2_rc3_ch41n}" > /var/www/flag2.txt && \
    chmod 644 /var/www/flag2.txt

EXPOSE 8080

CMD ["node", "server.js"]
