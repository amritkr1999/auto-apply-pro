import React from "react";
import { Helmet } from "react-helmet-async";

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  noIndex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = "EasyNaukri - Auto Job Application & Cold Outreach Email Platform",
  description = "EasyNaukri is an AI-powered auto job application and cold outreach email platform. Optimize your resume, streamline recruiter outreach, and automate job searches with one click.",
  canonicalUrl = "https://easynaukri.online/",
  ogImage = "https://easynaukri.online/dashboard_mockup.png",
  ogType = "website",
  jsonLd,
  noIndex = false,
}) => {
  const fullTitle = title.includes("EasyNaukri") ? title : `${title} | EasyNaukri`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph / Facebook / LinkedIn */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="EasyNaukri" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
