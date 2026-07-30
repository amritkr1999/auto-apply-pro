import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JobApplication, ApplicationStatus } from '../services/jobTrackerService';

interface KanbanBoardProps {
  applications: JobApplication[];
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
  onAddJob: () => void;
  onSelectJob: (app: JobApplication) => void;
}

const STAGES: { key: ApplicationStatus; label: string; color: string; bg: string; border: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'WISHLIST', label: 'Wishlist', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20', icon: 'bookmark-outline' },
  { key: 'APPLIED', label: 'Applied', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-200 dark:border-sky-500/20', icon: 'paper-plane-outline' },
  { key: 'INTERVIEWING', label: 'Interviewing', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', icon: 'people-outline' },
  { key: 'OFFER', label: 'Offer', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: 'trophy-outline' },
  { key: 'REJECTED', label: 'Rejected', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', icon: 'close-circle-outline' },
];

export default function KanbanBoard({ applications, onStatusChange, onAddJob, onSelectJob }: KanbanBoardProps) {
  const [selectedAppForStatus, setSelectedAppForStatus] = useState<JobApplication | null>(null);

  const getAppsForStage = (stageKey: ApplicationStatus) => {
    return applications.filter(app => app.status === stageKey);
  };

  const handleStatusSelect = (newStatus: ApplicationStatus) => {
    if (selectedAppForStatus?.id) {
      onStatusChange(selectedAppForStatus.id, newStatus);
      setSelectedAppForStatus(null);
    }
  };

  return (
    <View className="flex-1">
      {/* Top Header & Actions */}
      <View className="flex-row justify-between items-center px-5 py-3">
        <View>
          <Text className="text-slate-900 dark:text-white font-bold text-lg">Application Tracker</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-xs">{applications.length} active jobs in pipeline</Text>
        </View>
        <TouchableOpacity
          onPress={onAddJob}
          className="flex-row items-center bg-emerald-500 rounded-xl px-3.5 py-2 active:opacity-90"
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text className="text-white font-bold text-xs ml-1">New Application</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll Kanban Columns */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 px-3">
        {STAGES.map((stage) => {
          const stageApps = getAppsForStage(stage.key);
          return (
            <View key={stage.key} className="w-[280px] mx-2 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-4 flex-1">
              
              {/* Column Header */}
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <View className={`p-1.5 rounded-lg mr-2 ${stage.bg}`}>
                    <Ionicons name={stage.icon} size={16} className={stage.color} color={stage.key === 'OFFER' ? '#10b981' : stage.key === 'INTERVIEWING' ? '#f59e0b' : stage.key === 'APPLIED' ? '#0ea5e9' : stage.key === 'WISHLIST' ? '#a855f7' : '#f43f5e'} />
                  </View>
                  <Text className="text-slate-900 dark:text-white font-bold text-sm">{stage.label}</Text>
                </View>
                <View className="bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  <Text className="text-slate-600 dark:text-slate-300 text-xs font-bold">{stageApps.length}</Text>
                </View>
              </View>

              {/* Application Cards List */}
              <ScrollView showsVerticalScrollIndicator={false} className="space-y-3">
                {stageApps.map((app) => (
                  <TouchableOpacity
                    key={app.id || app.companyName + app.jobTitle}
                    onPress={() => onSelectJob(app)}
                    activeOpacity={0.85}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm mb-3"
                  >
                    <View className="flex-row justify-between items-start mb-1.5">
                      <Text className="text-slate-900 dark:text-white font-bold text-base flex-1 pr-2" numberOfLines={1}>
                        {app.jobTitle}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setSelectedAppForStatus(app)}
                        className="p-1"
                      >
                        <Ionicons name="ellipsis-vertical" size={16} color="#94a3b8" />
                      </TouchableOpacity>
                    </View>

                    <Text className="text-slate-600 dark:text-slate-400 font-semibold text-xs mb-2">{app.companyName}</Text>

                    {app.location ? (
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="location-outline" size={12} color="#94a3b8" />
                        <Text className="text-slate-500 dark:text-slate-400 text-[11px] ml-1" numberOfLines={1}>{app.location}</Text>
                      </View>
                    ) : null}

                    {app.currentRound ? (
                      <View className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 mt-1">
                        <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Current Stage</Text>
                        <Text className="text-slate-800 dark:text-slate-200 text-xs font-semibold" numberOfLines={1}>{app.currentRound}</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                ))}

                {stageApps.length === 0 && (
                  <View className="border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 items-center justify-center my-4">
                    <Text className="text-slate-400 text-xs italic text-center">No applications in {stage.label}</Text>
                  </View>
                )}
              </ScrollView>

            </View>
          );
        })}
      </ScrollView>

      {/* Move Stage Modal */}
      <Modal
        visible={!!selectedAppForStatus}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAppForStatus(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSelectedAppForStatus(null)}
          className="flex-1 bg-black/60 justify-center items-center px-6"
        >
          <TouchableOpacity activeOpacity={1} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm">
            <Text className="text-slate-900 dark:text-white font-bold text-lg mb-1">Change Stage</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs mb-4">
              Move "{selectedAppForStatus?.jobTitle}" at {selectedAppForStatus?.companyName} to:
            </Text>

            <View className="space-y-2">
              {STAGES.map((st) => (
                <TouchableOpacity
                  key={st.key}
                  onPress={() => handleStatusSelect(st.key)}
                  className={`flex-row items-center justify-between p-3.5 rounded-2xl border mb-2 ${
                    selectedAppForStatus?.status === st.key
                      ? 'bg-emerald-500/10 border-emerald-500'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Ionicons name={st.icon} size={18} color={selectedAppForStatus?.status === st.key ? '#10b981' : '#64748b'} />
                    <Text className={`font-semibold text-sm ml-3 ${selectedAppForStatus?.status === st.key ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                      {st.label}
                    </Text>
                  </View>
                  {selectedAppForStatus?.status === st.key && (
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
