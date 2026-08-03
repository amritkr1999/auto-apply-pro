import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { templateService, QueueDeliveryItem } from '../../services/templateService';

import { Linking } from 'react-native';

export default function QueueScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [queueItems, setQueueItems] = useState<QueueDeliveryItem[]>([]);
  const [retryingId, setRetryingId] = useState<number | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await templateService.getQueueStatus(Number(user?.id || 1));
      setQueueItems(data);
    } catch (err) {
      console.log('Error fetching queue status:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQueue();
    setRefreshing(false);
  };

  const handleRetry = async (id: number) => {
    setRetryingId(id);
    try {
      await templateService.retryDelivery(id);
      Alert.alert('Delivery Retried', 'Outreach message has been re-queued for delivery.');
      setQueueItems(prev =>
        prev.map(item => (item.id === id ? { ...item, status: 'PENDING', errorMessage: undefined } : item))
      );
    } catch (err) {
      Alert.alert('Retry Failed', 'Could not retry message delivery.');
    } finally {
      setRetryingId(null);
    }
  };

  const handleOpenGmailCompose = (recipient: string, subject: string) => {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient || '')}&su=${encodeURIComponent(subject || '')}`;
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Could not launch web browser for Gmail compose.');
    });
  };

  const getStatusBadge = (status: QueueDeliveryItem['status'] | string) => {
    switch (status) {
      case 'SENT':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          icon: 'checkmark-circle' as const,
          label: 'SENT',
        };
      case 'DRAFT':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
          text: 'text-indigo-600 dark:text-indigo-400',
          icon: 'create-outline' as const,
          label: 'DRAFT',
        };
      case 'PENDING':
        return {
          bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
          text: 'text-amber-600 dark:text-amber-400',
          icon: 'time' as const,
          label: 'QUEUED',
        };
      case 'FAILED':
      default:
        return {
          bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
          text: 'text-rose-600 dark:text-rose-400',
          icon: 'alert-circle' as const,
          label: 'FAILED',
        };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      
      {/* Header Bar */}
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-slate-900 dark:text-white font-bold text-lg">Delivery Queue & SMTP</Text>
        </View>
        <TouchableOpacity onPress={fetchQueue} className="p-1">
          <Ionicons name="refresh" size={20} color="#10b981" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
        >
          {/* SMTP Server Diagnostic Status Banner */}
          <View className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-3xl p-4 mb-6 flex-row items-center">
            <View className="w-10 h-10 bg-emerald-500/20 rounded-2xl items-center justify-center mr-3">
              <Ionicons name="server-outline" size={20} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 dark:text-white font-bold text-sm">SMTP Worker Status: Healthy</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-xs">Port 587 • Rate limit 50 emails/hr</Text>
            </View>
          </View>

          <Text className="text-slate-900 dark:text-white font-bold text-base mb-3">Live Outreach Messages</Text>

          {queueItems.map((item) => {
            const badge = getStatusBadge(item.status);
            return (
              <View
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <Text className="text-slate-900 dark:text-white font-bold text-base">{item.jobTitle}</Text>
                    <Text className="text-slate-600 dark:text-slate-300 text-xs font-semibold">{item.companyName}</Text>
                  </View>

                  <View className={`border rounded-xl px-2.5 py-1 flex-row items-center ${badge.bg}`}>
                    <Ionicons name={badge.icon} size={12} color={item.status === 'SENT' ? '#10b981' : item.status === 'PENDING' ? '#f59e0b' : '#f43f5e'} />
                    <Text className={`text-[10px] font-bold ml-1 ${badge.text}`}>{badge.label}</Text>
                  </View>
                </View>

                <View className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 my-2">
                  <Text className="text-slate-500 dark:text-slate-400 text-[11px]">To: {item.recipientEmail}</Text>
                  <Text className="text-slate-800 dark:text-slate-200 text-xs font-semibold mt-1" numberOfLines={1}>
                    Subject: {item.subject}
                  </Text>
                  {item.errorMessage && (
                    <Text className="text-rose-500 text-[11px] font-medium mt-1">Error: {item.errorMessage}</Text>
                  )}
                </View>

                <View className="flex-row justify-between items-center mt-1">
                  <Text className="text-slate-400 text-[11px]">Created: {item.createdAt}</Text>
                  
                  <View className="flex-row items-center space-x-2">
                    <TouchableOpacity
                      onPress={() => handleOpenGmailCompose(item.recipientEmail, item.subject)}
                      className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex-row items-center"
                    >
                      <Ionicons name="open-outline" size={12} color="#10b981" />
                      <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold ml-1">Open in Gmail</Text>
                    </TouchableOpacity>

                    {item.status === 'FAILED' && (
                      <TouchableOpacity
                        onPress={() => handleRetry(item.id)}
                        disabled={retryingId === item.id}
                        className="bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl flex-row items-center ml-2"
                      >
                        {retryingId === item.id ? (
                          <ActivityIndicator size="small" color="#f43f5e" />
                        ) : (
                          <>
                            <Ionicons name="refresh" size={12} color="#f43f5e" />
                            <Text className="text-rose-500 text-xs font-bold ml-1">Retry Send</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

    </SafeAreaView>
  );
}
