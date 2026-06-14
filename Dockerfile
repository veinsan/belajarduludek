FROM node:22-alpine
WORKDIR /app

# Install ALL dependencies — devDependencies (typescript, @tailwindcss/postcss)
# are required by `next build`.
COPY package*.json ./
RUN npm ci

COPY . .

# Generate the Prisma client before the build compiles imports of @prisma/client.
RUN npx prisma generate

# `next build` evaluates server modules and lib/prisma.ts throws when
# DATABASE_URL is unset. No query runs during the build, so a placeholder is
# enough — the real value comes from docker-compose at runtime (host `db`).
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npm run build

EXPOSE 3000

# Entrypoint applies pending migrations and seeds the initial admin account
# before starting the server, so `docker compose up` needs no manual steps.
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
