import React from "react";

export interface OnboardingChecklistWidgetProps {
  candidateProfile?: any;
  gmailConnected?: boolean;
  dispatchMode?: string;
  campaignEnabled?: boolean;
  sentCount?: number;
  queueCount?: number;
  userId?: number;
  onOpenProfile?: () => void;
  onConnectGmail?: () => void;
  onOpenOutreachModes?: () => void;
  onStartCampaign?: () => void;
  onOpenUserManual?: (sectionKey?: string) => void;
}

export declare const OnboardingChecklistWidget: React.FC<OnboardingChecklistWidgetProps>;
export default OnboardingChecklistWidget;
