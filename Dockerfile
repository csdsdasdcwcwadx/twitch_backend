# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# 只複製 dependency 相關檔案（利用快取）
COPY package*.json ./
RUN npm ci

# 複製原始碼並 build
COPY src ./src
RUN npm run build


# ---------- Runtime stage ----------
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# 只複製 production 需要的檔案
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder \
  /app/node_modules/ecpay_aio_nodejs/lib \
  ./node_modules/ecpay_aio_nodejs/lib

EXPOSE 4000

CMD ["node", "dist/index.js"]