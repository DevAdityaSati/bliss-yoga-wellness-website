import { useEffect } from 'react';

interface MetaHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export default function MetaHead({
  title = 'Bliss Yoga & Wellness | Sacred Online Yoga & Meditation Sanctuary',
  description = 'Transformative online yoga programs, private sessions, pranayama, and meditation guided by master instructors worldwide.',
  canonicalUrl = 'https://blissyoga.com',
  ogImage = 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200',
}: MetaHeadProps) {
  useEffect(() => {
    // Page Title
    document.title = title;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // OpenGraph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    // OpenGraph Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    // OpenGraph Image
    let ogImg = document.querySelector('meta[property="og:image"]');
    if (!ogImg) {
      ogImg = document.createElement('meta');
      ogImg.setAttribute('property', 'og:image');
      document.head.appendChild(ogImg);
    }
    ogImg.setAttribute('content', ogImage);

    // JSON-LD Structured Schema
    const schemaId = 'bliss-yoga-schema';
    let schemaScript = document.getElementById(schemaId) as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'ExerciseGym',
      'name': 'Bliss Yoga & Wellness Sanctuary',
      'image': ogImage,
      'description': description,
      'url': canonicalUrl,
      'telephone': '+1-800-555-YOGA',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'San Francisco',
        'addressRegion': 'CA',
        'addressCountry': 'US'
      },
      'priceRange': '$$',
      'openingHoursSpecification': {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        'opens': '06:00',
        'closes': '22:00'
      }
    };

    schemaScript.textContent = JSON.stringify(structuredData);
  }, [title, description, canonicalUrl, ogImage]);

  return null;
}
