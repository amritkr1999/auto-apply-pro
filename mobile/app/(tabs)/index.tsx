import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { feedbackService } from '../../services/feedbackService';
import FeedbackModal from '../../components/FeedbackModal';
import WalkthroughTour from '../../components/WalkthroughTour';

import { outreachService } from '../../services/outreachService';
import { jobTrackerService, JobApplication, JobApplicationStats } from '../../services/jobTrackerService';
import CampaignDispatchModal from '../../components/CampaignDispatchModal';

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
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Campaign State
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignActive, setCampaignActive] = useState(false);
  const [campaignToggling, setCampaignToggling] = useState(false);

  // Real-time API States
  const [statsData, setStatsData] = useState<JobApplicationStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (user?.id) {
      outreachService.getOutreachSettings(Number(user.id))
        .then(settings => setCampaignActive(Boolean(settings?.hrOutreachCampaignEnabled)))
        .catch(() => {});
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    setLoadingData(true);
    try {
      const [statsRes, appsRes] = await Promise.all([
        jobTrackerService.getStats(Number(user.id)),
        jobTrackerService.getApplications(Number(user.id)),
      ]);
      setStatsData(statsRes);
      setRecentApplications(appsRes.slice(0, 5));
    } catch (e) {
      console.log('Error fetching dashboard live data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleToggleCampaign = async (enable: boolean) => {
    setCampaignToggling(true);
    try {
      const userIdNum = Number(user?.id || 1);
      const res = await outreachService.toggleHrCampaign(userIdNum, enable);
      setCampaignActive(res.enabled);
    } catch (e) {
      console.log('Toggle campaign failed:', e);
    } finally {
      setCampaignToggling(false);
    }
  };

  const handleLaunchAutomated = async (selectedMode: string) => {
    await handleToggleCampaign(true);
  };

  useEffect(() => {
    if (!user?.id) return;

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
  }, [user?.id]);

  const handleLogoutPress = async () => {
    if (!user?.id) {
      signOut();
      return;
    }

    try {
      const feedbackOptOut = await SecureStore.getItemAsync('feedback_opt_out');
      if (feedbackOptOut === 'true') {
        signOut();
        return;
      }

      const status = await feedbackService.getFeedbackStatus();
      if (status.showPopup) {
        setShowFeedback(true);
      } else {
        signOut();
      }
    } catch (err) {
      console.log('Failed to check feedback status on logout, signing out', err);
      signOut();
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDashboardData().then(() => {
      setRefreshing(false);
    });
  }, [user?.id]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
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
              onPress={handleLogoutPress}
              className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full items-center justify-center shadow-sm"
            >
              <Ionicons name="log-out-outline" size={20} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Free Trial & Streak Banner */}
        <View className="mx-5 mb-6 bg-gradient-to-r bg-emerald-500 rounded-3xl p-5 shadow-md">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-3">
              <Text className="text-emerald-100 text-xs font-bold uppercase tracking-wider">PRO PLAN • ACTIVE</Text>
              <Text className="text-white text-lg font-bold mt-0.5">7-Day Free Trial Running</Text>
              <Text className="text-emerald-100 text-xs mt-1 font-medium">🔥 5-Day Application Streak Active!</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/billing/pricing')}
              className="bg-white/20 px-3.5 py-2 rounded-2xl"
            >
              <Text className="text-white text-xs font-bold">Manage Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Feature Access Grid */}
        <View className="px-5 mb-6">
          <Text className="text-slate-900 dark:text-white text-lg font-bold mb-3">Feature Hub</Text>
          <View className="flex-row flex-wrap gap-2.5">
            <TouchableOpacity
              onPress={() => router.push('/govt-exams' as any)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex-1 min-w-[45%] flex-row items-center shadow-sm"
            >
              <View className="w-10 h-10 bg-rose-500/10 rounded-xl items-center justify-center mr-3">
                <Ionicons name="school-outline" size={20} color="#f43f5e" />
              </View>
              <View>
                <Text className="text-slate-900 dark:text-white font-bold text-xs">Govt Exams</Text>
                <Text className="text-slate-400 text-[10px]">Alerts & PYQs</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/harvester' as any)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex-1 min-w-[45%] flex-row items-center shadow-sm"
            >
              <View className="w-10 h-10 bg-indigo-500/10 rounded-xl items-center justify-center mr-3">
                <Ionicons name="compass-outline" size={20} color="#6366f1" />
              </View>
              <View>
                <Text className="text-slate-900 dark:text-white font-bold text-xs">HR Harvester</Text>
                <Text className="text-slate-400 text-[10px]">Scrape Recruiters</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/outreach/drafts' as any)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex-1 min-w-[45%] flex-row items-center shadow-sm"
            >
              <View className="w-10 h-10 bg-amber-500/10 rounded-xl items-center justify-center mr-3">
                <Ionicons name="mail-unread-outline" size={20} color="#f59e0b" />
              </View>
              <View>
                <Text className="text-slate-900 dark:text-white font-bold text-xs">AI Email Drafts</Text>
                <Text className="text-slate-400 text-[10px]">Review & Send</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/referral' as any)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex-1 min-w-[45%] flex-row items-center shadow-sm"
            >
              <View className="w-10 h-10 bg-emerald-500/10 rounded-xl items-center justify-center mr-3">
                <Ionicons name="gift-outline" size={20} color="#10b981" />
              </View>
              <View>
                <Text className="text-slate-900 dark:text-white font-bold text-xs">Refer & Earn</Text>
                <Text className="text-slate-400 text-[10px]">UPI Rewards</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* HR Cold Email Campaign Widget */}
        <View className="mx-5 mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-indigo-500/10 rounded-2xl items-center justify-center mr-3">
                <Ionicons name="rocket-outline" size={20} color="#6366f1" />
              </View>
              <View>
                <Text className="text-slate-900 dark:text-white font-bold text-sm">HR Cold Email Campaign</Text>
                <View className="flex-row items-center mt-0.5">
                  <View className={`w-2 h-2 rounded-full mr-1.5 ${campaignActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <Text className={`text-xs font-bold ${campaignActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {campaignActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowCampaignModal(true)}
              className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex-row items-center"
            >
              <Ionicons name="settings-outline" size={16} color="#6366f1" />
              <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold ml-1">Modes</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">
            Automatically draft and dispatch cold outreach emails to HR targets according to schedule.
          </Text>

          <TouchableOpacity
            onPress={() => {
              if (!campaignActive) {
                setShowCampaignModal(true);
              } else {
                handleToggleCampaign(false);
              }
            }}
            disabled={campaignToggling}
            className={`py-3 rounded-2xl items-center justify-center ${
              campaignActive ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
          >
            {campaignToggling ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-xs">
                {campaignActive ? 'Pause Campaign' : '🚀 Start Campaign'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Live Metrics Container */}
        <View className="px-5">
          <Text className="text-slate-900 dark:text-white text-lg font-bold mb-4">Outreach Performance</Text>
          <View className="flex-row flex-wrap justify-between">
            <MetricCard
              title="Applications"
              value={statsData?.totalApplications ?? 124}
              change="+14 this week"
              iconName="briefcase"
              colorClass="bg-indigo-500/10"
              iconColor="#6366f1"
            />
            <MetricCard
              title="Interviews"
              value={statsData?.activeInterviews ?? 4}
              change="2 scheduled"
              iconName="people"
              colorClass="bg-sky-500/10"
              iconColor="#0ea5e9"
            />
            <MetricCard
              title="Offers"
              value={statsData?.offersReceived ?? 1}
              change="1 pending review"
              iconName="trophy"
              colorClass="bg-emerald-500/10"
              iconColor="#10b981"
            />
            <MetricCard
              title="Response Rate"
              value={`${statsData?.overallResponseRate ?? 20.8}%`}
              change="+2.4% vs last mo"
              iconName="analytics"
              colorClass="bg-amber-500/10"
              iconColor="#f59e0b"
            />
          </View>
        </View>

        {/* Live Applications Feed */}
        <View className="px-5 mt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-900 dark:text-white text-lg font-bold">Recent Pipeline Statuses</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
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
                  {app.jobTitle}
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{app.companyName}</Text>
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={12} color="#94a3b8" />
                  <Text className="text-slate-500 dark:text-slate-400 text-xs ml-1">{app.appliedAt || 'Recent'}</Text>
                </View>
              </View>

              {/* Status Badge */}
              <View className="border border-emerald-500/20 bg-emerald-500/10 rounded-xl px-3 py-1 items-center justify-center">
                <Text className="text-emerald-500 text-[10px] font-bold tracking-wider">{app.status}</Text>
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
            onLogout={() => {
              setShowFeedback(false);
              signOut();
            }}
          />
          <WalkthroughTour
            userId={String(user.id)}
            visible={showTour}
            onClose={() => setShowTour(false)}
          />
          <CampaignDispatchModal
            visible={showCampaignModal}
            onClose={() => setShowCampaignModal(false)}
            onLaunchAutomated={handleLaunchAutomated}
            userId={Number(user.id)}
          />
        </>
      )}
    </SafeAreaView>
  );
}
