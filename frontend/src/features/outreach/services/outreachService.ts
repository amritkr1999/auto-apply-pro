const API_BASE = "http://localhost:8060/api";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface OutreachDraft {
  id?: string;
  templateId?: string;
  recipientEmail: string;
  subject: string;
  body: string;
  status: "PENDING" | "SENT" | "FAILED" | "BLACKLISTED" | "PAUSED";
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "default-1",
    name: "General Application Outreach",
    subject: "Application for {{jobRole}} | {{hrName}}",
    body: `Hi {{hrName}},<br/><br/>I hope you are doing well.<br/><br/>I am reaching out to express my interest in the <strong>{{jobRole}}</strong> position at <strong>{{companyName}}</strong>. Having worked with frontend systems, I believe my background aligns well with your team's current expansion goals.<br/><br/>Please find my profile details attached. I would love to connect and discuss how I can add value to {{companyName}}.<br/><br/>Best regards,<br/>Candidate User`
  },
  {
    id: "default-2",
    name: "Quick Follow-Up Template",
    subject: "Follow up: {{jobRole}} application - {{companyName}}",
    body: `Hi {{hrName}},<br/><br/>Hope your week is going well.<br/><br/>I wanted to quickly check in on my application for the <strong>{{jobRole}}</strong> role. I remain very excited about the opportunity to join <strong>{{companyName}}</strong> and would love to share more about my experience.<br/><br/>Looking forward to hearing from you.<br/><br/>Best,<br/>Candidate User`
  }
];

// In-memory/LocalStorage fallback cache for offline development mode
const getLocalTemplates = (): EmailTemplate[] => {
  const local = localStorage.getItem("email_templates");
  if (!local) {
    localStorage.setItem("email_templates", JSON.stringify(DEFAULT_TEMPLATES));
    return DEFAULT_TEMPLATES;
  }
  return JSON.parse(local);
};

const saveLocalTemplates = (templates: EmailTemplate[]) => {
  localStorage.setItem("email_templates", JSON.stringify(templates));
};

export const outreachService = {
  // Get all email templates
  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await fetch(`${API_BASE}/templates`);
      if (response.ok) {
        return response.json();
      }
    } catch {
      console.warn("Backend /api/templates unavailable. Falling back to local storage.");
    }
    return getLocalTemplates();
  },

  // Save/Create a new template
  async saveTemplate(template: Omit<EmailTemplate, "id"> & { id?: string }): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      id: template.id || `tpl-${Date.now()}`,
      name: template.name,
      subject: template.subject,
      body: template.body
    };

    try {
      const response = await fetch(`${API_BASE}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate)
      });
      if (response.ok) {
        return response.json();
      }
    } catch {
      console.warn("Backend save template failed. Saving to local storage fallback.");
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
        method: "DELETE"
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

  // Save an outreach draft to the sending queue
  async saveDraft(draft: Omit<OutreachDraft, "status">): Promise<OutreachDraft> {
    const finalDraft: OutreachDraft = {
      ...draft,
      id: `draft-${Date.now()}`,
      status: "PENDING"
    };

    try {
      const response = await fetch(`${API_BASE}/drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  }
};
