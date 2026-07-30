import { api } from './api';

export interface LearningTopic {
  id: number;
  title: string;
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  questionCount: number;
  description: string;
  iconName: string;
}

export interface LearningRoadmap {
  id: number;
  title: string;
  role: string;
  estimatedHours: number;
  steps: { id: number; title: string; description: string; status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' }[];
}

export interface QuestionSubmission {
  id?: number;
  topicTitle: string;
  questionText: string;
  answerExplanation: string;
  codeSnippet?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
}

export const learningService = {
  getTopics: async (): Promise<LearningTopic[]> => {
    try {
      const response = await api.get<LearningTopic[]>('/learning/topics');
      return response.data;
    } catch (error) {
      console.log('[learningService] Fetch topics failed, returning mock topics:', error);
      return [
        { id: 1, title: 'React Native & Expo Architecture', category: 'Mobile', difficulty: 'INTERMEDIATE', questionCount: 24, description: 'Bridge vs JSI, TurboModules, Reanimated 3, Metro bundler optimization.', iconName: 'phone-portrait-outline' },
        { id: 2, title: 'TypeScript Advanced Generics', category: 'Frontend', difficulty: 'ADVANCED', questionCount: 18, description: 'Conditional types, mapped types, template literal types, type guards.', iconName: 'code-slash-outline' },
        { id: 3, title: 'Spring Boot 3 & Security Architecture', category: 'Backend', difficulty: 'INTERMEDIATE', questionCount: 30, description: 'JWT authentication, Spring Security 6 filters, JPA specs, Hibernate caching.', iconName: 'server-outline' },
        { id: 4, title: 'System Design & Scalability', category: 'Architecture', difficulty: 'ADVANCED', questionCount: 42, description: 'Distributed caching, database sharding, microservices, message queues.', iconName: 'cube-outline' },
      ];
    }
  },

  getRoadmaps: async (): Promise<LearningRoadmap[]> => {
    try {
      const response = await api.get<LearningRoadmap[]>('/learning/roadmaps');
      return response.data;
    } catch (error) {
      console.log('[learningService] Fetch roadmaps failed, returning mock roadmaps:', error);
      return [
        {
          id: 1,
          title: 'Senior Mobile Engineer Roadmap',
          role: 'Mobile Lead',
          estimatedHours: 40,
          steps: [
            { id: 101, title: 'React Native Core Internals', description: 'Understand Fabric renderer and New Architecture.', status: 'COMPLETED' },
            { id: 102, title: 'Performance Optimization & Profiling', description: 'Memory leak detection, 60 FPS scroll performance.', status: 'IN_PROGRESS' },
            { id: 103, title: 'Native Modules & Swift/Kotlin', description: 'Build custom native Android/iOS bridge modules.', status: 'LOCKED' },
          ],
        },
        {
          id: 2,
          title: 'Full Stack Tech Lead Path',
          role: 'Full Stack Architect',
          estimatedHours: 65,
          steps: [
            { id: 201, title: 'Microservices & Event-Driven Systems', description: 'Kafka & RabbitMQ pub/sub patterns.', status: 'COMPLETED' },
            { id: 202, title: 'DevOps & Kubernetes Deployment', description: 'Docker multi-stage builds and K8s manifests.', status: 'LOCKED' },
          ],
        },
      ];
    }
  },

  submitQuestion: async (userId: number, submission: QuestionSubmission): Promise<QuestionSubmission> => {
    try {
      const response = await api.post<QuestionSubmission>(`/learning/questions/user/${userId}`, submission);
      return response.data;
    } catch (error) {
      console.log('[learningService] Submit question failed, returning mock success:', error);
      return { ...submission, id: Date.now(), status: 'PENDING', createdAt: 'Just now' };
    }
  },

  getUserSubmissions: async (userId: number): Promise<QuestionSubmission[]> => {
    try {
      const response = await api.get<QuestionSubmission[]>(`/learning/questions/user/${userId}`);
      return response.data;
    } catch (error) {
      console.log('[learningService] Fetch user submissions failed, returning mocks:', error);
      return [
        { id: 1, topicTitle: 'React Native & Expo Architecture', questionText: 'How does Expo Router handle file-based dynamic routes?', answerExplanation: 'Expo Router converts file structures into React Navigation stack and tab navigators.', status: 'APPROVED', createdAt: '2 days ago' },
        { id: 2, topicTitle: 'Spring Boot 3', questionText: 'What is the purpose of @EntityGraph in JPA?', answerExplanation: 'Prevents N+1 query problem by specifying lazy fetch attributes eagerly.', status: 'PENDING', createdAt: 'Yesterday' },
      ];
    }
  },
};
