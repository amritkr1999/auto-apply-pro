const API_BASE = "http://localhost:8060/api/v1";

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

export interface Topic {
  id: number;
  name: string;
  description: string;
  icon?: string;
  subtopics?: Topic[];
}

export interface Roadmap {
  id: number;
  title: string;
  description: string;
  icon?: string;
  progressPercentage: number;
  steps?: RoadmapStep[];
}

export interface RoadmapStep {
  id: number;
  stepOrder: number;
  title: string;
  description: string;
  progressPercentage: number;
  topics: Topic[];
}

export interface Resource {
  id: number;
  title: string;
  url: string;
  type: "DOCUMENTATION" | "VIDEO";
  description: string;
  completed: boolean;
}

export interface PracticeQuestion {
  id: number;
  title: string;
  content: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  choices: string[];
  completed: boolean;
  topicName?: string;
}

export interface SubmitResponse {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
}

export interface DailyContent {
  tip?: {
    id: number;
    title: string;
    content: string;
  };
  question?: PracticeQuestion;
}

export interface TopicProgressDetail {
  topicId: number;
  topicName: string;
  solvedQuestions: number;
  totalQuestions: number;
  completedResources: number;
  totalResources: number;
  percentage: number;
}

export interface Progress {
  totalQuestions: number;
  solvedQuestions: number;
  totalResources: number;
  completedResources: number;
  overallPercentage: number;
  topicProgress: TopicProgressDetail[];
}

export const learningService = {
  async getTopics(): Promise<Topic[]> {
    const response = await fetch(`${API_BASE}/learning/topics`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load topics");
    }
    return response.json();
  },

  async getResources(topicId: number): Promise<Resource[]> {
    const response = await fetch(`${API_BASE}/learning/topics/${topicId}/resources`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load resources");
    }
    return response.json();
  },

  async getQuestions(topicId: number): Promise<PracticeQuestion[]> {
    const response = await fetch(`${API_BASE}/learning/topics/${topicId}/questions`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load questions");
    }
    return response.json();
  },

  async submitAnswer(questionId: number, answer: string): Promise<SubmitResponse> {
    const response = await fetch(`${API_BASE}/learning/questions/${questionId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ answer }),
    });
    if (!response.ok) {
      throw new Error("Failed to submit answer");
    }
    return response.json();
  },

  async toggleResource(resourceId: number): Promise<{ completed: boolean }> {
    const response = await fetch(`${API_BASE}/learning/resources/${resourceId}/complete`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to toggle resource completion");
    }
    return response.json();
  },

  async getDailyContent(): Promise<DailyContent> {
    const response = await fetch(`${API_BASE}/learning/daily`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load daily content");
    }
    return response.json();
  },

  async getProgress(): Promise<Progress> {
    const response = await fetch(`${API_BASE}/learning/progress`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load learning progress");
    }
    return response.json();
  },

  async getRoadmaps(): Promise<Roadmap[]> {
    const response = await fetch(`${API_BASE}/learning/roadmaps`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load roadmaps");
    }
    return response.json();
  },

  async getRoadmapDetails(id: number): Promise<Roadmap> {
    const response = await fetch(`${API_BASE}/learning/roadmaps/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to load roadmap details");
    }
    return response.json();
  },
};
