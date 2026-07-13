import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { feedbackService } from '../../services/feedbackService';
import FeedbackModal from '../../components/FeedbackModal';
import WalkthroughTour from '../../components/WalkthroughTour';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  iconName: keyof typeof Ionicons.glyphMap;
  colorClass: string;
  iconColor: string;
}

function MetricCard({ title, value, change, iconName, colorClass, iconColor }: MetricCardProps) {
  return (
    <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 w-[47%] mb-4 shadow-sm dark:shadow-md">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</Text>
        <View className={`w-8 h-8 rounded-xl items-center justify-center ${colorClass}`}>
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>
      </View>
      <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</Text>
      <Text className="text-emerald-500 dark:text-emerald-400 text-xs font-medium">{change}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Check tour & feedback popup on mount
  useEffect(() => {
    if (!user?.id) return;

    // Check tour eligibility
    const checkTour = async () => {
      try {
        const completed = await SecureStore.getItemAsync(`walkthrough_completed_${user.id}`);
        if (completed !== 'true') {
          setShowTour(true);
        }
      } catch (e) {
        console.log('Error checking tour status:', e);
      }
    };
    checkTour();

    // Check feedback eligibility after a short delay
    const timer = setTimeout(async () => {
      try {
        // Check local snooze
        const snoozedUntil = await SecureStore.getItemAsync('feedback_snoozed_until');
        if (snoozedUntil && Date.now() < parseInt(snoozedUntil, 10)) {
          return;
        }

        const status = await feedbackService.getFeedbackStatus();
        if (status.showPopup) {
          setShowFeedback(true);
        }
      } catch (err) {
        console.log('Failed to check feedback eligibility:', err);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [user?.id]);

  // Mock statistics & history
  const [stats] = useState({
    totalApplications: 124,
    emailsSent: 82,
    roleResponseRate: '18.3%',
    activeInterviews: 4,
  });

  const [recentApplications] = useState([
    { id: 1, title: 'Senior Software Engineer', company: 'Google', date: 'Today', status: 'INTERVIEWING', statusColor: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20' },
    { id: 2, title: 'React Native Developer', company: 'Shopify', date: 'Yesterday', status: 'SENT', statusColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
    { id: 3, title: 'Frontend Engineer', company: 'Vercel', date: '2 days ago', status: 'REVIEW', statusColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
    { id: 4, title: 'Full Stack Engineer', company: 'Linear', date: '5 days ago', status: 'REJECTED', statusColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' },
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
      >
        
        {/* Header Section */}
        <View className="px-5 py-6 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">Welcome back,</Text>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{user?.name || 'Candidate'}</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowTour(true)}
              className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full items-center justify-center shadow-sm"
              accessibilityLabel="Guided Tour"
            >
              <Ionicons name="help-circle-outline" size={20} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={signOut}
              className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full items-center justify-center shadow-sm"
            >
              <Ionicons name="log-out-outline" size={20} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dashboard Banner */}
        <View className="mx-5 mb-6 bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-500/20 dark:to-teal-500/20 border border-emerald-200 dark:border-emerald-500/30 rounded-3xl p-5 flex-row justify-between items-center">
          <View className="flex-1 pr-4">
            <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">AI Coach Alert</Text>
            <Text className="text-slate-900 dark:text-white text-base font-semibold mt-1">3 Job openings need reviews</Text>
            <Text className="text-slate-650 dark:text-slate-300 text-xs mt-1">AI has drafted personalized outreach emails. Swipe through them now.</Text>
          </View>
          <View className="w-12 h-12 bg-emerald-500 rounded-2xl items-center justify-center">
            <Ionicons name="sparkles" size={24} color="#fff" />
          </View>
        </View>

        {/* Metrics Container */}
        <View className="px-5">
          <Text className="text-slate-900 dark:text-white text-lg font-bold mb-4">Outreach Performance</Text>
          <View className="flex-row flex-wrap justify-between">
            <MetricCard
              title="Total Scraped"
              value={stats.totalApplications}
              change="+14 this week"
              iconName="search"
              colorClass="bg-indigo-500/10"
              iconColor="#6366f1"
            />
            <MetricCard
              title="Outreach Sent"
              value={stats.emailsSent}
              change="+8 this week"
              iconName="paper-plane"
              colorClass="bg-emerald-500/10"
              iconColor="#10b981"
            />
            <MetricCard
              title="Response Rate"
              value={stats.roleResponseRate}
              change="+2.4% vs last mo"
              iconName="analytics"
              colorClass="bg-amber-500/10"
              iconColor="#f59e0b"
            />
            <MetricCard
              title="Active Steps"
              value={stats.activeInterviews}
              change="2 scheduled today"
              iconName="people"
              colorClass="bg-sky-500/10"
              iconColor="#0ea5e9"
            />
          </View>
        </View>

        {/* Recent Applications Feed */}
        <View className="px-5 mt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-900 dark:text-white text-lg font-bold">Recent Pipeline Statuses</Text>
            <TouchableOpacity>
              <Text className="text-emerald-500 dark:text-emerald-400 text-xs font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          {recentApplications.map((app) => (
            <View
              key={app.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex-row justify-between items-center mb-3 shadow-sm"
            >
              <View className="flex-1 pr-4">
                <Text className="text-slate-900 dark:text-white font-bold text-base leading-tight mb-1" numberOfLines={1}>
                  {app.title}
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{app.company}</Text>
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={12} color="#94a3b8" />
                  <Text className="text-slate-500 dark:text-slate-400 text-xs ml-1">{app.date}</Text>
                </View>
              </View>

              {/* Status Badge */}
              <View className={`border rounded-xl px-3 py-1 items-center justify-center ${app.statusColor}`}>
                <Text className="text-[10px] font-bold tracking-wider">{app.status}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Popups & Modals */}
      {user?.id && (
        <>
          <FeedbackModal
            visible={showFeedback}
            onClose={() => setShowFeedback(false)}
          />
          <WalkthroughTour
            userId={String(user.id)}
            visible={showTour}
            onClose={() => setShowTour(false)}
          />
        </>
      )}
    </SafeAreaView>
  );
}
