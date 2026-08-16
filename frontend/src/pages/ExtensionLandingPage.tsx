import React from 'react';
import ExtensionDownloadSection from '../features/opportunities/components/ExtensionDownloadSection';
import SEOHead from '../components/SEOHead';

export const ExtensionLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <SEOHead
        title="EasyNaukri Chrome Extension - Download & Setup"
        description="Download and install the official EasyNaukri Chrome Extension for 1-click recruiter email discovery and automated job harvesting."
      />
      <ExtensionDownloadSection />
    </div>
  );
};

export default ExtensionLandingPage;
