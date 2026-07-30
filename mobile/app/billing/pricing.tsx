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
import { billingService, PlanTier } from '../../services/billingService';

export default function PricingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<PlanTier[]>([]);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await billingService.getPlans();
      setPlans(data);
    } catch (e) {
      console.log('Error fetching billing plans:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: PlanTier) => {
    try {
      const portalUrl = await billingService.getStripePortalUrl(Number(user?.id || 1));
      await WebBrowser.openBrowserAsync(portalUrl);
    } catch (err) {
      Alert.alert('Checkout Error', 'Failed to launch subscription checkout.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      
      {/* Header Bar */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-slate-900 dark:text-white font-bold text-lg">Subscription Plans</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/billing/portal')} className="p-1">
          <Ionicons name="card-outline" size={22} color="#10b981" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          
          {/* Billing Cycle Switcher */}
          <View className="flex-row bg-slate-200/60 dark:bg-slate-900 p-1 rounded-2xl mb-6 border border-slate-200 dark:border-slate-800">
            <TouchableOpacity
              onPress={() => setBillingCycle('MONTHLY')}
              className={`flex-1 py-2.5 items-center rounded-xl ${
                billingCycle === 'MONTHLY' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-transparent'
              }`}
            >
              <Text className={`font-bold text-xs ${billingCycle === 'MONTHLY' ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                Monthly Billing
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setBillingCycle('YEARLY')}
              className={`flex-1 py-2.5 items-center rounded-xl ${
                billingCycle === 'YEARLY' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-transparent'
              }`}
            >
              <Text className={`font-bold text-xs ${billingCycle === 'YEARLY' ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                Yearly Billing (Save 20%)
              </Text>
            </TouchableOpacity>
          </View>

          {plans.map((plan) => {
            const priceDisplay = billingCycle === 'MONTHLY' ? plan.priceMonthly : plan.priceYearly;
            return (
              <View
                key={plan.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 mb-6 shadow-sm ${
                  plan.isPopular ? 'border-emerald-500 shadow-emerald-500/10' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {plan.isPopular && (
                  <View className="bg-emerald-500 self-start px-3 py-1 rounded-full mb-3">
                    <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Most Popular</Text>
                  </View>
                )}

                <Text className="text-slate-900 dark:text-white text-xl font-bold">{plan.name}</Text>

                <View className="flex-row items-baseline my-3">
                  <Text className="text-slate-900 dark:text-white text-3xl font-extrabold">{priceDisplay}</Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-xs ml-1 font-semibold">
                    /{billingCycle === 'MONTHLY' ? 'month' : 'year'}
                  </Text>
                </View>

                <View className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 mb-4">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-slate-500 text-xs font-semibold">AI Tokens</Text>
                    <Text className="text-slate-900 dark:text-white text-xs font-bold">{plan.aiTokenLimit}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-slate-500 text-xs font-semibold">Outreach Sending</Text>
                    <Text className="text-slate-900 dark:text-white text-xs font-bold">{plan.outreachLimit}</Text>
                  </View>
                </View>

                <Text className="text-slate-900 dark:text-white font-bold text-xs uppercase mb-3 tracking-wider">Included Features</Text>

                <View className="space-y-2 mb-6">
                  {plan.features.map((feat) => (
                    <View key={feat} className="flex-row items-center mb-1.5">
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                      <Text className="text-slate-700 dark:text-slate-300 text-xs font-medium ml-2 flex-1">{feat}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => handleUpgrade(plan)}
                  className={`rounded-2xl py-3.5 items-center ${
                    plan.isPopular
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20 active:opacity-90'
                      : 'bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 active:bg-slate-200 dark:active:bg-slate-850'
                  }`}
                >
                  <Text className={`font-bold text-sm ${plan.isPopular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {plan.id === 'free' ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

    </SafeAreaView>
  );
}
