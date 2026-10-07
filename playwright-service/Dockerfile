FROM mcr.microsoft.com/playwright:v1.48.0-noble

WORKDIR /app

# Copiar definiciones de dependencias
COPY package*.json tsconfig.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript a JavaScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
