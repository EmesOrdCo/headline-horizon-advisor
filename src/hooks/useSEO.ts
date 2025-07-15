import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOConfig {
  title?: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
}

export const useSEO = (config: SEOConfig) => {
  const location = useLocation();

  useEffect(() => {
    // Set title
    if (config.title) {
      document.title = `${config.title} | MarketSensorAI`;
    }

    // Set or update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', config.description);

    // Set canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    const canonicalUrl = config.canonical || `${window.location.origin}${location.pathname}`;
    canonicalLink.setAttribute('href', canonicalUrl);

    // Set noindex if specified
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (config.noindex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, follow');
    } else if (robotsMeta) {
      robotsMeta.setAttribute('content', 'index, follow');
    }

    // Cleanup function to reset title on unmount
    return () => {
      if (config.title) {
        document.title = 'MarketSensorAI';
      }
    };
  }, [config, location.pathname]);
};