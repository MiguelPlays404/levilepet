import { Helmet } from "react-helmet-async";

const SITE_URL = "https://levillepet.lovable.app";

interface SeoProps {
  /** Título da página (sem o nome da marca — ele é adicionado automaticamente). */
  title: string;
  description: string;
  /** Caminho da rota, ex.: "/hotelzinho". */
  path: string;
  /** URL absoluta da imagem de preview social (opcional). */
  image?: string;
  noindex?: boolean;
  /** JSON-LD adicional específico da página. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function Seo({ title, description, path, image, noindex, jsonLd }: SeoProps) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title.includes("Le Ville Pet") ? title : `${title} | Le Ville Pet`;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="pt_BR" />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}

/** Breadcrumb JSON-LD helper para páginas internas. */
export function breadcrumbLd(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${path}` },
    ],
  };
}

export { SITE_URL };
