import { API_BASE, buildApiUrl } from "../../../config/api";

const API_BASE_V1 = `${API_BASE}/v1`;

const getAuthHeaders = (): Record<string, string> => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.token) {
        return {
          "Authorization": `Bearer ${user.token}`
        };
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
    }
  }
  return {};
};

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  intro?: string;
  skillsTemplate?: string;
  body: string;
  signOff?: string;
  templateType?: "EMAIL" | "COVER_LETTER";
  isSystemTemplate?: boolean;
  isPublic?: boolean;
  creatorId?: number;
  averageRating?: number;
  isFavorited?: boolean;
  userRating?: number;
}

export interface OutreachDraft {
  id?: string;
  templateId?: string;
  recipientEmail: string;
  ccEmails?: string;
  parsedEmails?: string;
  subject: string;
  body: string;
  status: "DRAFT" | "SUGGESTION" | "PENDING" | "SENT" | "FAILED" | "BLACKLISTED" | "PAUSED";
  userId?: number;
  scheduledAt?: string;
  profileId?: number;
  profileName?: string;
  companyName?: string;
  jobTitle?: string;
  coverLetterFilename?: string;
  coverLetterContentType?: string;
  coverLetterBody?: string;
  coverLetterDeliveryType?: "ATTACHMENT" | "INLINE";
  coverLetterMode?: "TEMPLATE" | "UPLOADED" | "AI_GENERATED" | "NONE";
  coverLetterTemplateId?: string;
}

export interface CoverLetterRequest {
  userId?: number;
  profileId?: number;
  jobDetails?: {
    title?: string;
    company?: string;
    description?: string;
    skills?: string[];
  };
  templateId?: string;
  mode?: "TEMPLATE" | "UPLOADED" | "AI_GENERATED" | "NONE";
  deliveryType?: "ATTACHMENT" | "INLINE";
  candidateName?: string;
}

export interface CoverLetterResponse {
  mode: string;
  deliveryType: string;
  content: string;
  filename?: string;
  contentType?: string;
  isAiAvailable?: boolean;
  message?: string;
  pdfBytes?: string;
}

export interface TrialEmailRequest {
  templateId?: string;
  subject?: string;
  intro?: string;
  skillsTemplate?: string;
  body?: string;
  signOff?: string;
  targetEmail?: string;
  sampleData?: Record<string, string>;
}

export interface TrialEmailResponse {
  success: boolean;
  message: string;
  recipientEmail?: string;
  renderedSubject?: string;
  sentAt?: string;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "default-1",
    name: "General Application Outreach",
    subject: "Application for {{jobRole}} | {{companyName}}",
    intro: "Dear {{recruiterName}},",
    skillsTemplate: "I am writing to apply for the {{jobRole}} position. I noticed your team is looking for a developer experienced in {{skills}}, which maps closely to my skillset.",
    body: "I have over {{experienceYears}} years of software development experience, focusing on building high-performance systems and user-centric features.",
    signOff: "Regards,\n{{candidateName}}\n{{candidateMobile}}\n{{candidateEmail}}",
    isSystemTemplate: true,
    isPublic: true
  },
  {
    id: "default-2",
    name: "Quick Follow-Up Template",
    subject: "Follow up: {{jobRole}} application - {{companyName}}",
    intro: "Hi {{recruiterName}},",
    skillsTemplate: "I wanted to follow up on my application for the {{jobRole}} role. My hands-on skills in {{skills}} make me excited about joining {{companyName}}.",
    body: "I have {{experienceYears}} years of experience building scalable products and would love to connect to share more.",
    signOff: "Regards,\n{{candidateName}}\n{{candidateMobile}}\n{{candidateEmail}}",
    isSystemTemplate: true,
    isPublic: true
  },
  {
    id: "default-3",
    name: "Referral Request",
    subject: "Connecting regarding open roles at {{companyName}}",
    intro: "Dear {{recruiterName}},",
    skillsTemplate: "I noticed that {{companyName}} is expanding and looking for developers skilled in {{skills}}. I wanted to connect to see if my background might be a fit.",
    body: "I have {{experienceYears}} years of software engineering experience building highly scalable applications and products. I would be grateful for a referral or any advice you might have on applying.",
    signOff: "Best regards,\n{{candidateName}}\n{{candidateMobile}}\n{{candidateEmail}}",
    isSystemTemplate: true,
    isPublic: true
  },
  {
    id: "default-4",
    name: "Networking & Informational Interview",
    subject: "Inquiry: Engineering team growth at {{companyName}}",
    intro: "Hi {{recruiterName}},",
    skillsTemplate: "I've been following {{companyName}}'s growth and was particularly interested in your work requiring {{skills}}.",
    body: "With {{experienceYears}} years of software development experience, I’m keen to learn more about the team culture, recent challenges, and future direction. Would you be open to a brief 10-minute informational chat sometime next week?",
    signOff: "Sincerely,\n{{candidateName}}\n{{candidateMobile}}\n{{candidateEmail}}",
    isSystemTemplate: true,
    isPublic: true
  },
  {
    id: "default-5",
    name: "Product-focused Application",
    subject: "Improving {{companyName}}'s developer experience | {{jobRole}} Application",
    intro: "Dear {{recruiterName}},",
    skillsTemplate: "I am a software engineer specializing in {{skills}} with a deep passion for building high-quality products that users love.",
    body: "Throughout my {{experienceYears}} years of experience, I have focused on shipping user-centric features, optimizing performance, and collaborating closely with design and product teams.",
    signOff: "Best,\n{{candidateName}}\n{{candidateMobile}}\n{{candidateEmail}}",
    isSystemTemplate: true,
    isPublic: true
  }
];

// In-memory/LocalStorage fallback cache for offline development mode
const getLocalTemplates = (): EmailTemplate[] => {
  const local = localStorage.getItem("email_templates");
  let list: EmailTemplate[] = [];
  if (!local) {
    list = DEFAULT_TEMPLATES;
  } else {
    try {
      list = JSON.parse(local);
    } catch {
      list = DEFAULT_TEMPLATES;
    }
  }

  // Ensure system templates are marked as isSystemTemplate: true
  return list.map(t => ({
    ...t,
    isSystemTemplate: t.isSystemTemplate || t.id.startsWith("default-")
  }));
};

const saveLocalTemplates = (templates: EmailTemplate[]) => {
  localStorage.setItem("email_templates", JSON.stringify(templates));
};

export const outreachService = {
  // Get all email templates
  // Get all email/cover letter templates
  async getTemplates(sortBy?: string, type?: string): Promise<EmailTemplate[]> {
    try {
      const params = new URLSearchParams();
      if (sortBy) params.append("sortBy", sortBy);
      if (type) params.append("type", type);

      const queryString = params.toString();
      const url = queryString ? `${API_BASE}/templates?${queryString}` : `${API_BASE}/templates`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        return response.json();
      }
    } catch (e) {
      console.warn("Backend /api/templates unavailable. Falling back to local storage.", e);
    }
    const tpls = getLocalTemplates();
    const favorites = JSON.parse(localStorage.getItem("email_template_favorites") || "[]");
    return tpls
      .filter(t => !type || (type.toUpperCase() === (t.templateType || "EMAIL").toUpperCase()))
      .map(t => ({
        ...t,
        isFavorited: favorites.includes(t.id),
        averageRating: t.averageRating || 0.0
      }));
  },

  async generateCoverLetter(request: CoverLetterRequest): Promise<CoverLetterResponse> {
    const response = await fetch(`${API_BASE}/outreach/cover-letter/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(request)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to generate cover letter");
    }
    return response.json();
  },

  // Save/Create a new template
  async saveTemplate(template: Omit<EmailTemplate, "id"> & { id?: string }): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      id: template.id || `tpl-${Date.now()}`,
      name: template.name,
      subject: template.subject,
      intro: template.intro,
      skillsTemplate: template.skillsTemplate,
      body: template.body,
      signOff: template.signOff
    };

    try {
      const response = await fetch(`${API_BASE}/templates`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(newTemplate)
      });
      if (response.ok) {
        return response.json();
      } else {
        const errMsg = await response.text();
        throw new Error(errMsg || "Failed to save template.");
      }
    } catch (e: any) {
      if (e.message && e.message !== "Failed to fetch" && !e.message.includes("network")) {
        throw e;
      }
      console.warn("Backend save template failed. Saving to local storage fallback.", e);
    }

    const current = getLocalTemplates();
    const existingIdx = current.findIndex(t => t.id === newTemplate.id);
    if (existingIdx > -1) {
      current[existingIdx] = newTemplate;
    } else {
      current.push(newTemplate);
    }
    saveLocalTemplates(current);
    return newTemplate;
  },

  // Delete an existing template
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/templates/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        return true;
      }
    } catch {
      console.warn("Backend delete template failed. Removing from local storage fallback.");
    }

    const current = getLocalTemplates();
    const filtered = current.filter(t => t.id !== id);
    saveLocalTemplates(filtered);
    return true;
  },

  // Toggle template favorite bookmark status
  async toggleFavorite(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/templates/${id}/favorite`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        return response.json();
      }
    } catch (e) {
      console.warn("Backend toggle favorite failed.", e);
    }
    const favorites = JSON.parse(localStorage.getItem("email_template_favorites") || "[]");
    const index = favorites.indexOf(id);
    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem("email_template_favorites", JSON.stringify(favorites));
      return false;
    } else {
      favorites.push(id);
      localStorage.setItem("email_template_favorites", JSON.stringify(favorites));
      return true;
    }
  },

  // Rate a template
  async rateTemplate(id: string, rating: number, comment?: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/templates/${id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ rating, comment }),
      });
      if (response.ok) {
        return response.json();
      } else {
        const errMsg = await response.text();
        throw new Error(errMsg || "Failed to submit rating.");
      }
    } catch (e: any) {
      if (e.message && e.message !== "Failed to fetch" && !e.message.includes("network")) {
        throw e;
      }
      console.warn("Backend rate template failed. Simulating locally.", e);
    }
    const ratings = JSON.parse(localStorage.getItem("email_template_ratings") || "{}");
    ratings[id] = rating;
    localStorage.setItem("email_template_ratings", JSON.stringify(ratings));
    return { templateId: id, rating };
  },

  // Save an outreach draft to the sending queue
  async saveDraft(draft: Partial<OutreachDraft> & { recipientEmail: string; subject: string; body: string }): Promise<OutreachDraft> {
    const userStr = localStorage.getItem("user");
    const userId = userStr ? JSON.parse(userStr).id : 1;

    const finalDraft: OutreachDraft = {
      userId,
      status: "PENDING",
      ...draft,
      id: draft.id || `draft-${Date.now()}`
    };

    try {
      const response = await fetch(`${API_BASE}/drafts`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(finalDraft)
      });
      if (response.ok) {
        return response.json();
      }
    } catch {
      console.warn("Backend save draft failed. Persisting draft to local queue fallback.");
    }

    // Save to local drafts queue
    const localQueue = JSON.parse(localStorage.getItem("email_outreach_queue") || "[]");
    localQueue.push(finalDraft);
    localStorage.setItem("email_outreach_queue", JSON.stringify(localQueue));
    return finalDraft;
  },

  // Update/Approve draft
  async updateDraft(id: string, draft: Partial<OutreachDraft>): Promise<OutreachDraft> {
    const response = await fetch(`${API_BASE}/drafts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(draft)
    });
    if (!response.ok) {
      throw new Error("Failed to update/approve email draft.");
    }
    return response.json();
  },

  // Delete draft
  async deleteDraft(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/drafts/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return response.ok;
    } catch {
      console.warn("Backend delete draft failed.");
      return false;
    }
  },

  // Generate outreach email draft using AI pipeline
  async generateOutreachEmail(userId: number, jobDetails: any, profileId?: number, templateId?: string, useAi?: boolean, candidateName?: string): Promise<{ subject: string; body: string; recipientEmail: string }> {
    const response = await fetch(`${API_BASE}/drafts/generate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ userId, jobDetails, profileId, templateId, useAi, candidateName })
    });
    if (!response.ok) {
      throw new Error("Failed to generate AI outreach email.");
    }
    return response.json();
  },

  async getOutreachQueue(userId: number): Promise<OutreachDraft[]> {
    const response = await fetch(`${API_BASE}/drafts/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load outreach queue history.");
    }
    return response.json();
  },

  // Connect Gmail: returns the OAuth redirect URL
  async getConnectUrl(userId: number): Promise<string> {
    const response = await fetch(buildApiUrl(`/v1/outreach/connect/google?userId=${userId}`), {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to get Gmail connection URL");
    }
    return response.text();
  },

  // Get Gmail Connection Status
  async getGmailStatus(userId: number): Promise<{ connected: boolean; connectedEmail: string | null }> {
    const response = await fetch(buildApiUrl(`/v1/outreach/status?userId=${userId}`), {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to get Gmail status");
    }
    return response.json();
  },

  // Disconnect Gmail
  async disconnectGmail(userId: number): Promise<{ message: string }> {
    const response = await fetch(buildApiUrl(`/v1/outreach/disconnect?userId=${userId}`), {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to disconnect Gmail");
    }
    return response.json();
  },

  // Get outreach scheduling settings
  async getOutreachSettings(userId: number): Promise<{
    dailyLimit: number;
    minIntervalMinutes: number;
    maxIntervalMinutes: number;
    slotStart: string;
    slotEnd: string;
    timezone: string;
    skipWeekends: boolean;
    hrOutreachCampaignEnabled: boolean;
    hrOutreachTargetRole: string;
    hrOutreachTemplateId: string;
    hrOutreachSourceTable: string;
    hrOutreachDispatchMode?: string;
    marketingEmailsEnabled: boolean;
    aiPersonalizationEnabled: boolean;
    outreachSkillsFormat: string;
  }> {
    try {
      const response = await fetch(`${API_BASE}/v1/outreach/settings?userId=${userId}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        return response.json();
      }
    } catch (e) {
      console.warn("Backend /settings unavailable. Falling back to local storage.", e);
    }

    // local storage fallback
    const localSettingsStr = localStorage.getItem(`outreach_settings_${userId}`);
    if (localSettingsStr) {
      return JSON.parse(localSettingsStr);
    }
    return {
      dailyLimit: 50,
      minIntervalMinutes: 10,
      maxIntervalMinutes: 30,
      slotStart: "09:00",
      slotEnd: "17:00",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      skipWeekends: true,
      hrOutreachCampaignEnabled: false,
      hrOutreachTargetRole: "Software Engineer",
      hrOutreachTemplateId: "default-1",
      hrOutreachSourceTable: "MAIN",
      hrOutreachDispatchMode: localStorage.getItem("campaign_dispatch_mode") || "DIRECT_SEND",
      marketingEmailsEnabled: true,
      aiPersonalizationEnabled: false,
      outreachSkillsFormat: "COMMA"
    };
  },

  // Save outreach scheduling settings
  async saveOutreachSettings(userId: number, settings: {
    dailyLimit: number;
    minIntervalMinutes: number;
    maxIntervalMinutes: number;
    slotStart: string;
    slotEnd: string;
    timezone: string;
    skipWeekends: boolean;
    hrOutreachCampaignEnabled?: boolean;
    hrOutreachTargetRole?: string;
    hrOutreachTemplateId?: string;
    hrOutreachSourceTable?: string;
    hrOutreachDispatchMode?: string;
    marketingEmailsEnabled?: boolean;
    aiPersonalizationEnabled?: boolean;
    outreachSkillsFormat?: string;
  }): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE}/v1/outreach/settings?userId=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        return response.json();
      } else {
        const errText = await response.text();
        try {
          const parsed = JSON.parse(errText);
          throw new Error(parsed.message || "Failed to save outreach settings.");
        } catch {
          throw new Error(errText || "Failed to save outreach settings.");
        }
      }
    } catch (e: any) {
      if (e.message && e.message !== "Failed to fetch" && !e.message.includes("network")) {
        throw e;
      }
      console.warn("Backend save settings failed. Saving to local storage fallback.", e);
    }

    // local storage fallback
    const currentSettings = await this.getOutreachSettings(userId);
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(`outreach_settings_${userId}`, JSON.stringify(updatedSettings));
    return { message: "Outreach settings updated successfully." };
  },

  // Quick toggle HR outreach campaign
  async toggleHrCampaign(userId: number, enable: boolean): Promise<{ enabled: boolean; message: string }> {
    const response = await fetch(`${API_BASE_V1}/outreach/settings/campaign/toggle?userId=${userId}&enable=${enable}`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      }
    });
    if (!response.ok) {
      const errText = await response.text();
      try {
        const parsed = JSON.parse(errText);
        throw new Error(parsed.message || "Failed to toggle campaign.");
      } catch {
        throw new Error(errText || "Failed to toggle campaign.");
      }
    }
    return response.json();
  },

  // Upload multiple screenshots to the backend queue
  async uploadScreenshots(userId: number, files: File[]): Promise<any[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });
    formData.append("userId", userId.toString());

    const response = await fetch(`${API_BASE}/screenshots/upload`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || "Failed to upload screenshots to backend queue.");
    }
    return response.json();
  },

  // Get screenshot upload logs/statuses for a user
  async getScreenshotUploads(userId: number): Promise<any[]> {
    const response = await fetch(`${API_BASE}/screenshots/user/${userId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error("Failed to fetch screenshot uploads.");
    }
    return response.json();
  },

  // Clear completed and failed screenshot upload logs
  async clearScreenshotUploadLogs(userId: number): Promise<any> {
    const response = await fetch(`${API_BASE}/screenshots/user/${userId}/clear`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error("Failed to clear screenshot uploads logs.");
    }
    return response.json();
  },

  // Delete a screenshot upload log by ID
  async deleteScreenshotUpload(id: number): Promise<any> {
    const response = await fetch(`${API_BASE}/screenshots/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error("Failed to delete screenshot upload log.");
    }
    return response.json();
  },

  // Create a draft directly via Gmail API POST https://gmail.googleapis.com/gmail/v1/users/me/drafts
  async createGmailDraftApi(to: string, subject: string, body: string): Promise<boolean> {
    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      body.replace(/\n/g, "<br/>")
    ].join("\r\n");

    const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const token = user?.accessToken || user?.token;

    try {
      if (token && token.length > 20 && !token.startsWith("eyJ")) {
        const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: { raw: encodedMessage }
          })
        });
        if (res.ok) return true;
      }
    } catch (e) {
      console.warn("Direct Gmail API call failed, falling back to local queue persistence.", e);
    }

    try {
      await this.saveDraft({
        recipientEmail: to,
        subject,
        body,
        status: "DRAFT"
      });
      return true;
    } catch (err) {
      console.error("Failed to save draft fallback", err);
      return false;
    }
  },

  // Send a trial email for template/outreach verification
  async sendTrialEmail(request: TrialEmailRequest): Promise<TrialEmailResponse> {
    const response = await fetch(`${API_BASE_V1}/outreach/trial-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send trial email");
    }
    return data;
  }
};

