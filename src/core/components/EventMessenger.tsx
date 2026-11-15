import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { create } from 'zustand';
import { Typography } from '../theme/typography';
import { useTheme } from '../theme/themeStore';
import { toast } from './Toast';

const { width } = Dimensions.get('window');

// -------------------------------------------------------------
// TYPES & STORE
// -------------------------------------------------------------

export type EventType = 'info' | 'success' | 'warning' | 'error';
export type EventCategory = 'system' | 'booking' | 'auth' | 'location' | 'captain';

export interface AppEvent {
  id: string;
  title: string;
  message: string;
  type: EventType;
  category: EventCategory;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'support' | 'system';
  text: string;
  timestamp: string;
}

interface EventMessengerState {
  events: AppEvent[];
  chatMessages: ChatMessage[];
  activeToast: AppEvent | null;
  isOpen: boolean;
  unreadCount: number;
  activeTab: 'events' | 'chat';
  emit: (event: Omit<AppEvent, 'id' | 'timestamp'>) => void;
  dismissToast: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setActiveTab: (tab: 'events' | 'chat') => void;
  sendChatMessage: (text: string) => void;
  clearEvents: () => void;
}

const initialEvents: AppEvent[] = [
  {
    id: 'evt-init-1',
    title: 'Platform Core Active',
    message: 'Backend API listening on live network with 0 latency.',
    type: 'success',
    category: 'system',
    timestamp: 'Just now',
  },
  {
    id: 'evt-init-2',
    title: 'Password Auth Ready',
    message: 'Direct Username/Mobile & Password verification (No OTP).',
    type: 'info',
    category: 'auth',
    timestamp: '1 min ago',
  },
  {
    id: 'evt-init-3',
    title: 'Sliding-Window Limiter & Idempotency',
    message: 'Cryptographic SHA-256 tokens & replay protection enabled.',
    type: 'success',
    category: 'system',
    timestamp: '2 mins ago',
  },
];

const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'support',
    text: 'Hello! I am your HelpNear Assistant. You can view all real-time project events here or ask me anything.',
    timestamp: '12:00 PM',
  },
];

export const useEventMessengerStore = create<EventMessengerState>((set, get) => ({
  events: initialEvents,
  chatMessages: initialChatMessages,
  activeToast: null,
  isOpen: false,
  unreadCount: initialEvents.length,
  activeTab: 'events',

  emit: (newEvent) => {
    const timeStr = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const eventItem: AppEvent = {
      ...newEvent,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
    };

    set((state) => ({
      events: [eventItem, ...state.events],
      activeToast: eventItem,
      unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
    }));

    // Trigger universal floating toast (success, failed, warn, info)
    if (newEvent.type === 'success') {
      toast.success(newEvent.title, newEvent.message);
    } else if (newEvent.type === 'error') {
      toast.failed(newEvent.title, newEvent.message);
    } else if (newEvent.type === 'warning') {
      toast.warn(newEvent.title, newEvent.message);
    } else {
      toast.info(newEvent.title, newEvent.message);
    }
  },

  dismissToast: () => set({ activeToast: null }),

  open: () => set({ isOpen: true, unreadCount: 0 }),
  close: () => set({ isOpen: false }),
  toggle: () => {
    const next = !get().isOpen;
    set({ isOpen: next, unreadCount: next ? 0 : get().unreadCount });
  },

  setActiveTab: (activeTab) => set({ activeTab }),

  sendChatMessage: (text) => {
    if (!text.trim()) return;
    const timeStr = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: timeStr,
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
    }));

    // Automated smart assistant response
    setTimeout(() => {
      let reply = 'Thank you for reaching out! Our dispatch team and available captains are ready to help.';
      const lower = text.toLowerCase();
      if (lower.includes('booking') || lower.includes('order')) {
        reply = 'You can track all your active requests directly in the "My Bookings" tab.';
      } else if (lower.includes('otp') || lower.includes('sms')) {
        reply = 'Good news! OTP verification has been removed. You can sign in and start jobs directly with your password.';
      } else if (lower.includes('captain') || lower.includes('technician')) {
        reply = 'Our verified technicians arrive at your location within 30 minutes with real-time tracking.';
      }

      const botMsg: ChatMessage = {
        id: `chat-bot-${Date.now()}`,
        sender: 'support',
        text: reply,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        chatMessages: [...state.chatMessages, botMsg],
      }));
    }, 600);
  },

  clearEvents: () => set({ events: [], unreadCount: 0 }),
}));

// Global convenient imperative interface
export const eventMessenger = {
  emit: (event: Omit<AppEvent, 'id' | 'timestamp'>) => {
    useEventMessengerStore.getState().emit(event);
  },
  open: () => useEventMessengerStore.getState().open(),
  close: () => useEventMessengerStore.getState().close(),
};

// -------------------------------------------------------------
// EVENT MESSENGER COMPONENT (MOUNTED IN ROOT LAYOUT)
// -------------------------------------------------------------

export const EventMessenger: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const {
    events,
    chatMessages,
    activeToast,
    isOpen,
    unreadCount,
    activeTab,
    dismissToast,
    toggle,
    close,
    setActiveTab,
    sendChatMessage,
    clearEvents,
    emit,
  } = useEventMessengerStore();

  const [chatInput, setChatInput] = useState('');

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
  };

  const handleSimulateTestEvent = () => {
    const demoEvents: Omit<AppEvent, 'id' | 'timestamp'>[] = [
      {
        title: 'New Service Booking Placed',
        message: 'Order #BK-9481 confirmed for AC Maintenance & Deep Cleaning.',
        type: 'success',
        category: 'booking',
      },
      {
        title: 'Captain Marco Accepted Job',
        message: 'Technician is en route to your address (ETA: 18 mins).',
        type: 'info',
        category: 'captain',
      },
      {
        title: 'Diagnostic Quotation Ready',
        message: 'Inspection completed: ₹750 quotation submitted for approval.',
        type: 'warning',
        category: 'booking',
      },
      {
        title: 'Service Completed & Paid',
        message: '₹1,045 settled via UPI. Invoice generated successfully.',
        type: 'success',
        category: 'booking',
      },
    ];

    const randomEvt = demoEvents[Math.floor(Math.random() * demoEvents.length)];
    emit(randomEvt);
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle' as const, color: '#16A34A', bg: '#DCFCE7' };
      case 'warning':
        return { name: 'alert-circle' as const, color: '#D97706', bg: '#FEF3C7' };
      case 'error':
        return { name: 'close-circle' as const, color: '#DC2626', bg: '#FEE2E2' };
      default:
        return { name: 'information-circle' as const, color: '#2563EB', bg: '#DBEAFE' };
    }
  };

  return (
    <View style={styles.overlayRoot} pointerEvents="box-none">
      {/* -------------------------------------------------------- */}
      {/* 1. TOP RIGHT FLOATING MESSENGER TRIGGER BUTTON           */}
      {/* -------------------------------------------------------- */}
      <View style={[styles.topRightPillContainer, { top: Math.max(insets.top, 14) + 6 }]} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={toggle}
          style={[
            styles.messengerPill,
            {
              backgroundColor: isDark ? '#1E293B' : '#0F172A',
              borderColor: isDark ? '#334155' : '#1E293B',
            },
          ]}
        >
          {/* Pulsing online beacon */}
          <View style={styles.pulseContainer}>
            <View style={styles.pulseDot} />
            <View style={styles.pulseRing} />
          </View>

          <Ionicons name="chatbubbles-sharp" size={15} color="#38BDF8" style={{ marginRight: 5 }} />
          <Text style={styles.pillText}>Events</Text>

          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* -------------------------------------------------------- */}
      {/* 2. EXPANDED EVENT MESSENGER DRAWER / MODAL               */}
      {/* -------------------------------------------------------- */}
      {isOpen && (
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.backdropDismiss}
            activeOpacity={1}
            onPress={close}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[
              styles.drawerSheet,
              {
                top: Math.max(insets.top, 14) + 48,
                bottom: Math.max(insets.bottom, 16) + 10,
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}
          >
            {/* Header */}
            <View style={[styles.drawerHeader, { borderBottomColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <View style={styles.drawerTitleRow}>
                <View style={styles.drawerIconSquare}>
                  <Ionicons name="flash" size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.drawerTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                    Event Messenger
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={styles.liveIndicatorDot} />
                    <Text style={styles.liveSubText}>Live Event Hub & Concierge</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity onPress={close} style={styles.drawerCloseCircle}>
                <Ionicons name="close" size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
              </TouchableOpacity>
            </View>

            {/* Segmented Control: Events vs Support Chat */}
            <View style={[styles.tabBar, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <TouchableOpacity
                onPress={() => setActiveTab('events')}
                style={[
                  styles.tabButton,
                  activeTab === 'events' && [
                    styles.tabButtonActive,
                    { backgroundColor: isDark ? '#334155' : '#FFFFFF' },
                  ],
                ]}
              >
                <Ionicons
                  name="newspaper-outline"
                  size={14}
                  color={activeTab === 'events' ? '#2563EB' : '#64748B'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'events' && [styles.tabButtonTextActive, { color: isDark ? '#FFFFFF' : '#0F172A' }],
                  ]}
                >
                  Live Events ({events.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('chat')}
                style={[
                  styles.tabButton,
                  activeTab === 'chat' && [
                    styles.tabButtonActive,
                    { backgroundColor: isDark ? '#334155' : '#FFFFFF' },
                  ],
                ]}
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={14}
                  color={activeTab === 'chat' ? '#2563EB' : '#64748B'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'chat' && [styles.tabButtonTextActive, { color: isDark ? '#FFFFFF' : '#0F172A' }],
                  ]}
                >
                  Concierge Chat
                </Text>
              </TouchableOpacity>
            </View>

            {/* TAB 1: REAL-TIME EVENTS LOG */}
            {activeTab === 'events' ? (
              <View style={{ flex: 1 }}>
                <ScrollView
                  style={styles.eventsScrollView}
                  contentContainerStyle={styles.eventsScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {events.length === 0 ? (
                    <View style={styles.emptyEventsBox}>
                      <Ionicons name="notifications-off-outline" size={36} color="#94A3B8" />
                      <Text style={styles.emptyEventsTitle}>No Recent Events</Text>
                      <Text style={styles.emptyEventsSub}>All platform events and notifications will appear here.</Text>
                    </View>
                  ) : (
                    events.map((evt) => {
                      const iconConfig = getEventIcon(evt.type);
                      return (
                        <View
                          key={evt.id}
                          style={[
                            styles.eventItemCard,
                            {
                              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                              borderColor: isDark ? '#334155' : '#E2E8F0',
                            },
                          ]}
                        >
                          <View style={[styles.eventItemIconBox, { backgroundColor: iconConfig.bg }]}>
                            <Ionicons name={iconConfig.name} size={18} color={iconConfig.color} />
                          </View>

                          <View style={{ flex: 1 }}>
                            <View style={styles.eventItemHeader}>
                              <View style={styles.categoryPill}>
                                <Text style={styles.categoryPillText}>{evt.category.toUpperCase()}</Text>
                              </View>
                              <Text style={styles.eventTimestamp}>{evt.timestamp}</Text>
                            </View>

                            <Text
                              style={[
                                styles.eventItemTitle,
                                { color: isDark ? '#F8FAFC' : '#0F172A' },
                              ]}
                            >
                              {evt.title}
                            </Text>
                            <Text
                              style={[
                                styles.eventItemMessage,
                                { color: isDark ? '#94A3B8' : '#475569' },
                              ]}
                            >
                              {evt.message}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  )}
                </ScrollView>

                {/* Event Actions Footer */}
                <View style={[styles.eventsFooter, { borderTopColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <TouchableOpacity
                    onPress={handleSimulateTestEvent}
                    style={styles.simulateBtn}
                  >
                    <Ionicons name="sparkles" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.simulateBtnText}>Simulate Live Event</Text>
                  </TouchableOpacity>

                  {events.length > 0 && (
                    <TouchableOpacity onPress={clearEvents} style={styles.clearBtn}>
                      <Text style={styles.clearBtnText}>Clear Log</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              /* TAB 2: LIVE CHAT MESSENGER */
              <View style={{ flex: 1 }}>
                <ScrollView
                  style={styles.chatScrollView}
                  contentContainerStyle={styles.chatScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {chatMessages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <View
                        key={msg.id}
                        style={[
                          styles.chatBubbleRow,
                          isUser ? styles.chatBubbleRowUser : styles.chatBubbleRowBot,
                        ]}
                      >
                        {!isUser && (
                          <View style={styles.botAvatar}>
                            <Ionicons name="headset" size={14} color="#FFFFFF" />
                          </View>
                        )}
                        <View
                          style={[
                            styles.chatBubble,
                            isUser ? styles.chatBubbleUser : styles.chatBubbleBot,
                            !isUser && { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chatBubbleText,
                              isUser
                                ? styles.chatBubbleTextUser
                                : { color: isDark ? '#F8FAFC' : '#0F172A' },
                            ]}
                          >
                            {msg.text}
                          </Text>
                          <Text
                            style={[
                              styles.chatBubbleTime,
                              isUser
                                ? styles.chatBubbleTimeUser
                                : { color: isDark ? '#94A3B8' : '#64748B' },
                            ]}
                          >
                            {msg.timestamp}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>

                {/* Quick Prompts */}
                <View style={styles.quickPromptsRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 14 }}>
                    <TouchableOpacity
                      onPress={() => sendChatMessage('Where is my service technician?')}
                      style={[styles.quickPromptChip, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                    >
                      <Text style={[styles.quickPromptText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                        📍 Track Captain
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => sendChatMessage('How do I pay after inspection?')}
                      style={[styles.quickPromptChip, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                    >
                      <Text style={[styles.quickPromptText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                        💳 Payment Options
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => sendChatMessage('Tell me about HelpNear security')}
                      style={[styles.quickPromptChip, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                    >
                      <Text style={[styles.quickPromptText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                        🛡️ Security & Idempotency
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>

                {/* Chat Input Bar */}
                <View style={[styles.chatInputBar, { borderTopColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <TextInput
                    style={[
                      styles.chatTextInput,
                      {
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        color: isDark ? '#FFFFFF' : '#0F172A',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      },
                    ]}
                    placeholder="Type a message or inquiry..."
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={chatInput}
                    onChangeText={setChatInput}
                    onSubmitEditing={handleSendChat}
                  />

                  <TouchableOpacity
                    onPress={handleSendChat}
                    style={styles.chatSendBtn}
                    disabled={!chatInput.trim()}
                  >
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
};

// -------------------------------------------------------------
// STYLES
// -------------------------------------------------------------

const styles = StyleSheet.create({
  overlayRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },

  /* Top Right Floating Pill */
  topRightPillContainer: {
    position: 'absolute',
    right: 14,
    zIndex: 9999,
  },
  messengerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 8,
  },
  pulseContainer: {
    width: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  pulseRing: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: 'rgba(34, 197, 94, 0.4)',
  },
  pillText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 6,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  /* Full Screen Backdrop & Drawer Sheet */
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    zIndex: 10001,
  },
  backdropDismiss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerSheet: {
    position: 'absolute',
    right: 14,
    left: 14,
    maxWidth: 460,
    alignSelf: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  drawerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drawerIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerTitle: {
    ...Typography.h2,
    fontSize: 16,
    fontWeight: '800',
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveSubText: {
    ...Typography.caption,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  drawerCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Segmented Tab Bar */
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    fontWeight: '800',
  },

  /* Events Log View */
  eventsScrollView: {
    flex: 1,
  },
  eventsScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 10,
  },
  emptyEventsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyEventsTitle: {
    ...Typography.h3,
    fontSize: 15,
    color: '#64748B',
    marginTop: 8,
  },
  emptyEventsSub: {
    ...Typography.caption,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  eventItemCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  eventItemIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  eventItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryPill: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3730A3',
    letterSpacing: 0.5,
  },
  eventTimestamp: {
    ...Typography.caption,
    fontSize: 10.5,
    color: '#94A3B8',
  },
  eventItemTitle: {
    ...Typography.h3,
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  eventItemMessage: {
    ...Typography.bodySmall,
    fontSize: 12,
    lineHeight: 16,
  },
  eventsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  simulateBtnText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearBtnText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },

  /* Chat Messenger View */
  chatScrollView: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 10,
  },
  chatBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  chatBubbleRowUser: {
    justifyContent: 'flex-end',
  },
  chatBubbleRowBot: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 2,
  },
  chatBubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
  },
  chatBubbleUser: {
    backgroundColor: '#1E40AF',
    borderBottomRightRadius: 4,
  },
  chatBubbleBot: {
    borderBottomLeftRadius: 4,
  },
  chatBubbleText: {
    ...Typography.bodySmall,
    fontSize: 13,
    lineHeight: 18,
  },
  chatBubbleTextUser: {
    color: '#FFFFFF',
  },
  chatBubbleTime: {
    fontSize: 9.5,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatBubbleTimeUser: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  quickPromptsRow: {
    paddingVertical: 6,
  },
  quickPromptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickPromptText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  chatTextInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  chatSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
