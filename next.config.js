/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  
  // Ignorar errores de typescript durante la construcción
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configurar webpack para evitar problemas con bcryptjs
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;