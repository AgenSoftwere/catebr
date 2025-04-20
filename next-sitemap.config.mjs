export const siteUrl = 'https://catebr.vercel.app';
export const generateRobotsTxt = true;
export const sitemapSize = 5000;
export const changefreq = 'daily';
export const priority = 0.7;
export async function transform(config, path) {
  // Customizar o comportamento do sitemap para cada página
  if (path === '/404') {
    return null; // Não inclua a página de erro 404
  }
  return {
    loc: path, // O link completo da página
    lastmod: new Date().toISOString(), // Data de última modificação
    changefreq: 'daily', // Frequência de atualização
    priority: 0.7, // Prioridade para o link
  };
}
