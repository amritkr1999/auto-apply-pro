import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../../context/AuthContext';
import { billingService, SubscriptionStatus } from '../../services/billingService';

export default function BillingPortalScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await billingService.getSubscriptionStatus(Number(user?.id || 1));
      setStatus(data);
    } catch (e) {
      console.log('Error fetching subscription status:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStripePortal = async () => {
    try {
      const portalUrl = await billingService.getStripePortalUrl(Number(user?.id || 1));
      await WebBrowser.openBrowserAsync(portalUrl);
    } catch (err) {
      Alert.alert('Portal Error', 'Failed to open Stripe Billing Portal.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-slate-900 dark:text-white font-bold text-lg">Billing & Subscriptions</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          
          {/* Subscription Overview Card */}
          <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 mb-6 shadow-sm">
            <Text className="text-emerald-500 text-xs font-bold uppercase tracking-wider">Active Membership</Text>
            <Text className="text-slate-900 dark:text-white text-2xl font-bold mt-1 mb-2">{status?.planName || 'Professional Pro'}</Text>

            <View className="flex-row items-center mb-4">
              <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
              <Text className="text-slate-600 dark:text-slate-300 text-xs font-semibold">
                Status: {status?.status} • Renews on {status?.renewsOn || '2026-08-28'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleOpenStripePortal}
              className="bg-emerald-500 rounded-2xl py-3.5 items-center flex-row justify-center active:opacity-90 shadow-lg shadow-emerald-500/20"
            >
              <Ionicons name="open-outline" size={18} color="#fff" />
              <Text className="text-white font-bold text-sm ml-2">Manage Payment Methods & Invoices</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/billing/pricing')}
            className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="sparkles-outline" size={20} color="#10b981" />
              <Text className="text-slate-900 dark:text-white font-bold text-sm ml-3">Explore Upgrade Plans</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

        </ScrollView>
      )}

    </SafeAreaView>
  );
}
