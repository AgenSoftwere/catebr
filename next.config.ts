
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // <--- ISSO DESATIVA O ESLINT NO DEPLOY
  },
  typescript: {
    ignoreBuildErrors: true, // opcional, se quiser ignorar erros TS também
  },
}

export default nextConfig
