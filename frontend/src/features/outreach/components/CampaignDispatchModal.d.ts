import React from "react";

export interface CampaignDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchAutomated?: () => Promise<void>;
  userId?: number;
  userProfile?: any;
  targetRole?: string;
  existingEmails?: Array<{
    id: string;
    company?: string;
    recipientEmail: string;
    subject: string;
    body: string;
  }>;
}

export declare const CampaignDispatchModal: React.FC<CampaignDispatchModalProps>;
export default CampaignDispatchModal;
