import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOConfig {
  title?: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  structuredData?: any;
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

    // Set Open Graph tags
    const ogTags = [
      { property: 'og:title', content: config.title || 'MarketSensorAI' },
      { property: 'og:description', content: config.description },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: config.ogType || 'website' },
      { property: 'og:image', content: config.ogImage || 'https://lovable.dev/opengraph-image-p98pqg.png' },
      { property: 'og:site_name', content: 'MarketSensorAI' }
    ];

    ogTags.forEach(tag => {
      let ogMeta = document.querySelector(`meta[property="${tag.property}"]`);
      if (!ogMeta) {
        ogMeta = document.createElement('meta');
        ogMeta.setAttribute('property', tag.property);
        document.head.appendChild(ogMeta);
      }
      ogMeta.setAttribute('content', tag.content);
    });

    // Set Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: config.twitterCard || 'summary_large_image' },
      { name: 'twitter:title', content: config.title || 'MarketSensorAI' },
      { name: 'twitter:description', content: config.description },
      { name: 'twitter:image', content: config.ogImage || 'https://lovable.dev/opengraph-image-p98pqg.png' },
      { name: 'twitter:site', content: '@lovable_dev' }
    ];

    twitterTags.forEach(tag => {
      let twitterMeta = document.querySelector(`meta[name="${tag.name}"]`);
      if (!twitterMeta) {
        twitterMeta = document.createElement('meta');
        twitterMeta.setAttribute('name', tag.name);
        document.head.appendChild(twitterMeta);
      }
      twitterMeta.setAttribute('content', tag.content);
    });

    // Add structured data (JSON-LD)
    if (config.structuredData) {
      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(config.structuredData);
      document.head.appendChild(script);
    }

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