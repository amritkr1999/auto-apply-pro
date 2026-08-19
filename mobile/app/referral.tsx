import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { referralService, ReferralDashboardData } from '../services/referralService';

export default function ReferralScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReferralDashboardData | null>(null);

  // Payout request modal states
  const [upiInput, setUpiInput] = useState('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, [user?.id]);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const res = await referralService.getReferralDashboard(Number(user?.id || 1));
      setData(res);
      if (res.upiId) setUpiInput(res.upiId);
    } catch (e) {
      console.log('Fetch referral data error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleShareLink = async () => {
    if (!data?.shareableLink) return;
    try {
      await Share.share({
        message: `Join me on Auto Apply Pro and automate your job applications! Use my link: ${data.shareableLink}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleRequestPayout = async () => {
    if (!upiInput.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid UPI ID (e.g., username@upi).');
      return;
    }
    if (!data || data.pendingBalanceAmount <= 0) {
      Alert.alert('No Balance', 'You currently have no pending balance to withdraw.');
      return;
    }

    setPayoutSubmitting(true);
    try {
      const res = await referralService.requestPayout({
        userId: Number(user?.id || 1),
        upiId: upiInput,
        amount: data.pendingBalanceAmount,
      });
      Alert.alert('Payout Requested', res.message);
      fetchReferralData();
    } catch (err) {
      Alert.alert('Error', 'Failed to submit payout request.');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <View className="px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#64748b" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-slate-900 dark:text-white font-bold text-lg">Referral & Rewards</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-xs">Earn Commissions & Track Payouts</Text>
        </View>
        <TouchableOpacity onPress={fetchReferralData} className="p-2">
          <Ionicons name="refresh" size={20} color="#10b981" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} className="flex-1">
        {loading || !data ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-3">Loading referral dashboard...</Text>
          </View>
        ) : (
          <>
            {/* Ambassador Tier Banner */}
            <View className="bg-gradient-to-r bg-emerald-500 p-5 rounded-3xl mb-6 shadow-md">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Your Ambassador Status</Text>
                <View className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">{data.tierName || 'Gold Member'}</Text>
                </View>
              </View>

              <Text className="text-white text-3xl font-extrabold mb-1">${data.totalEarningsAmount}</Text>
              <Text className="text-emerald-100 text-xs font-medium">
                Total Earned ({data.commissionPercentage || 15}% commission rate)
              </Text>
            </View>

            {/* Earnings Breakdown */}
            <View className="flex-row justify-between mb-6">
              <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 w-[48%]">
                <Text className="text-slate-400 text-xs font-semibold uppercase">Pending Balance</Text>
                <Text className="text-slate-900 dark:text-white text-xl font-bold mt-1">${data.pendingBalanceAmount}</Text>
              </View>

              <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 w-[48%]">
                <Text className="text-slate-400 text-xs font-semibold uppercase">Paid Out</Text>
                <Text className="text-emerald-500 text-xl font-bold mt-1">${data.paidOutAmount}</Text>
              </View>
            </View>

            {/* Shareable Link Card */}
            <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-sm">
              <Text className="text-slate-900 dark:text-white font-bold text-sm mb-1">Your Referral Link & Code</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs mb-3">
                Share this link with friends. Earn up to 15% recurring commission on every active plan!
              </Text>

              <View className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl flex-row items-center justify-between mb-3">
                <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex-1 mr-2" numberOfLines={1}>
                  {data.shareableLink}
                </Text>
                <View className="bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                  <Text className="text-emerald-500 font-bold text-xs">{data.referralCode}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleShareLink}
                className="bg-emerald-500 py-3 rounded-2xl items-center flex-row justify-center"
              >
                <Ionicons name="share-social-outline" size={18} color="#fff" />
                <Text className="text-white font-bold text-xs ml-2">Share Link</Text>
              </TouchableOpacity>
            </View>

            {/* UPI Payout Request Form */}
            <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-sm">
              <Text className="text-slate-900 dark:text-white font-bold text-sm mb-1">Request UPI Payout</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs mb-3">
                Withdraw pending rewards directly to your UPI address.
              </Text>

              <TextInput
                value={upiInput}
                onChangeText={setUpiInput}
                placeholder="Enter UPI ID (e.g. yourname@upi)"
                placeholderTextColor="#94a3b8"
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-3 text-slate-900 dark:text-white text-sm mb-3"
              />

              <TouchableOpacity
                onPress={handleRequestPayout}
                disabled={payoutSubmitting || data.pendingBalanceAmount <= 0}
                className={`py-3.5 rounded-2xl items-center justify-center ${
                  data.pendingBalanceAmount > 0 ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                {payoutSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-xs">
                    Withdraw ${data.pendingBalanceAmount} to UPI
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Recent Referral Activity */}
            <Text className="text-slate-900 dark:text-white font-bold text-base mb-3">Referral Activity</Text>
            {data.recentReferrals?.map((ref) => (
              <View
                key={ref.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-2 flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-slate-900 dark:text-white font-bold text-xs">{ref.referredUserEmail}</Text>
                  <Text className="text-slate-400 text-[10px] mt-0.5">{ref.createdAt}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-emerald-500 font-bold text-xs">+${ref.earnedAmount}</Text>
                  <Text className="text-slate-400 text-[10px] uppercase font-bold">{ref.status}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
