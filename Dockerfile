FROM node:18-alpine

WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install --production

# Expose port
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start server
CMD ["node", "server.js"]
