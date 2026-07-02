import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

interface WalkthroughTourProps {
  userId: string;
  visible: boolean;
  onClose: () => void;
}

interface TourStep {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

export default function WalkthroughTour({ userId, visible, onClose }: WalkthroughTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      title: "Welcome to Auto Apply Pro! 🚀",
      description: "Let's take a quick 1-minute tour of your candidate mobile dashboard to automate your job application outreach.",
      icon: "rocket-outline",
      iconColor: "#10b981",
    },
    {
      title: "Performance Metrics 📈",
      description: "Track your total job description scrapings, outreach emails sent, response rates, and interview pipelines in real time.",
      icon: "bar-chart-outline",
      iconColor: "#6366f1",
    },
    {
      title: "AI Coach Alerts 💡",
      description: "Check the AI Coach Banner for personalized match alerts and swipe drafts automatically tailored to job listings.",
      icon: "sparkles-outline",
      iconColor: "#fbbf24",
    },
    {
      title: "Job Queue Sourcing 💼",
      description: "Navigate to the Job Queue tab to upload job posting screenshots, monitor background AI OCR parsing, and verify drafts.",
      icon: "briefcase-outline",
      iconColor: "#0ea5e9",
    },
    {
      title: "Profile & Resume Sync 👤",
      description: "Manage your contact info, upload your resume PDF, and trigger the AI Resume Parser to automatically sync your skill chips.",
      icon: "person-outline",
      iconColor: "#f43f5e",
    },
    {
      title: "You're Ready to Automate! 🎉",
      description: "Ensure your credentials are up to date and begin scheduling outreach campaigns. Replay this tour anytime from the dashboard.",
      icon: "checkmark-circle-outline",
      iconColor: "#10b981",
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await SecureStore.setItemAsync(`walkthrough_completed_${userId}`, 'true');
    } catch (e) {
      console.log('Error saving walkthrough status:', e);
    }
    setCurrentStep(0);
    onClose();
  };

  const activeStep = steps[currentStep];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-slate-950/85 px-6">
        <View className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {/* Decorative glowing background bubbles */}
          <View className="absolute -top-12 -left-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <View className="absolute -bottom-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Progress bar */}
          <View className="flex-row h-1 bg-slate-800 rounded-full mb-6 overflow-hidden">
            {steps.map((_, idx) => (
              <View
                key={idx}
                className={`flex-1 h-full ${
                  idx <= currentStep ? 'bg-emerald-500' : 'bg-slate-850'
                }`}
                style={{ marginRight: idx < steps.length - 1 ? 2 : 0 }}
              />
            ))}
          </View>

          {/* Step content */}
          <View className="items-center py-2 mb-4">
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: `${activeStep.iconColor}15` }}
            >
              <Ionicons name={activeStep.icon} size={28} color={activeStep.iconColor} />
            </View>
            <Text className="text-white text-lg font-bold text-center px-1">
              {activeStep.title}
            </Text>
            <Text className="text-slate-400 text-sm text-center mt-3 px-2 leading-relaxed h-20">
              {activeStep.description}
            </Text>
          </View>

          {/* Controls Footer */}
          <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-slate-800/60">
            <TouchableOpacity
              onPress={handleFinish}
              className="active:opacity-80 py-1"
            >
              <Text className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Skip Tour</Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-3">
              {currentStep > 0 && (
                <TouchableOpacity
                  onPress={handleBack}
                  className="bg-slate-950 border border-slate-800 w-10 h-10 rounded-xl items-center justify-center active:bg-slate-850"
                >
                  <Ionicons name="arrow-back" size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleNext}
                className="bg-emerald-500 px-5 h-10 rounded-xl flex-row items-center justify-center active:opacity-90 shadow-md shadow-emerald-500/20"
              >
                <Text className="text-white font-bold text-sm">
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Text>
                {currentStep < steps.length - 1 && (
                  <Ionicons name="arrow-forward" size={14} color="#fff" style={{ marginLeft: 6 }} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
