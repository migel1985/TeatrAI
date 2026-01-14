# ---------- BUILD STAGE ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copiamos el código
COPY . .

# Compilamos Vite (genera /dist)
RUN npm run build


# ---------- RUN STAGE ----------
FROM nginx:alpine

# Eliminamos config por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Copiamos nuestra config
COPY nginx.conf /etc/nginx/conf.d

# Copiamos los ficheros compilados
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
