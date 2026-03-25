import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Shadows } from '../../lib/theme';
import { ThemedText } from '../../components/ui/ThemedText';
import { FloatingNav } from '../../components/ui/FloatingNav';

const MESSAGES = [
  {
    id: '1',
    sender: 'support',
    text: 'Hello! How can I help you plan your Kerala trip today?',
    time: '10:30 AM',
  },
  {
    id: '2',
    sender: 'user',
    text: 'I want to visit Munnar next week. What packages do you have?',
    time: '10:32 AM',
  },
  {
    id: '3',
    sender: 'support',
    text: 'Great choice! We have a 3-day Munnar package that includes accommodation, sightseeing, and transport. Would you like more details?',
    time: '10:33 AM',
  },
];

export default function ChatScreen() {
  const [message, setMessage] = React.useState('');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.supportInfo}>
            <View style={styles.supportAvatar}>
              <Ionicons name="headset" size={20} color={Colors.primary} />
            </View>
            <View>
              <ThemedText variant="cardTitle" color="light">
                Shahr Support
              </ThemedText>
              <ThemedText variant="small" color="lightMuted">
                Online
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContainer}
        >
          {MESSAGES.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.supportBubble,
              ]}
            >
              <ThemedText
                variant="body"
                color={msg.sender === 'user' ? 'primary' : 'light'}
              >
                {msg.text}
              </ThemedText>
              <ThemedText
                variant="caption"
                color={msg.sender === 'user' ? 'muted' : 'lightMuted'}
                style={styles.messageTime}
              >
                {msg.time}
              </ThemedText>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity style={styles.sendButton}>
              <Ionicons name="send" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <FloatingNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  supportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  supportAvatar: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    padding: Spacing.screenPadding,
    gap: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: Spacing.radiusLarge,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  supportBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.cardDark,
    borderBottomLeftRadius: 4,
  },
  messageTime: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    padding: Spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardDark,
    borderRadius: Spacing.radiusXL,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textLight,
    maxHeight: 80,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
