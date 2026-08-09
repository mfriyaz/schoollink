# Debian-based (not Alpine) specifically because `sharp` (image
# compression) needs this for its native bindings to work
# reliably without extra configuration.
FROM node:20-slim

WORKDIR /app

# Copy just the dependency manifests first, so Docker can cache
# this layer and skip re-running npm install on every rebuild
# unless package.json actually changed.
COPY package*.json ./

RUN npm install --omit=dev

# Now copy the actual application code.
COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
