# Builds the product app. Auth still needs the Supabase settings in app/.env.
FROM node:20-bookworm-slim
WORKDIR /repo

COPY package.json package-lock.json ./
COPY app/package.json app/package.json
COPY website/package.json website/package.json
COPY packages/brand/package.json packages/brand/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json

RUN npm ci --legacy-peer-deps

COPY . .

# prisma generate reads env() names from the schema. These are build placeholders.
ENV DATABASE_URL=postgresql://alavo:alavo@db:5432/alavo
ENV DIRECT_URL=postgresql://alavo:alavo@db:5432/alavo
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /repo/app
RUN npx prisma generate && npm run build

EXPOSE 3000
CMD ["npm", "start"]
