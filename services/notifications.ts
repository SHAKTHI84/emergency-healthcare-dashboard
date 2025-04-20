import axios from 'axios';
import { requestNotificationPermission } from '../utils/firebase';

// Register device for push notifications
export const registerForPushNotifications = async () => {
  try {
    const token = await requestNotificationPermission();
    if (token) {
      // Save token to user's profile in Supabase
      // This would need to be implemented based on authentication
      console.log('FCM Token:', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

// Send SMS via Twilio
export const sendSMS = async (to: string, message: string) => {
  try {
    // In a real implementation, this would call a server endpoint
    // that securely accesses the Twilio API
    const response = await axios.post('/api/send-sms', {
      to,
      message,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

// Send push notification
export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data: any = {}
) => {
  try {
    // In a real implementation, this would call a server endpoint
    // that securely accesses the Firebase Cloud Messaging API
    const response = await axios.post('/api/send-push', {
      token,
      notification: {
        title,
        body,
      },
      data,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

// Subscribe to a Supabase realtime channel
export const subscribeToChannel = (channelName: string, callback: (payload: any) => void) => {
  // This would be implemented using Supabase's realtime functionality
  // Example:
  // const channel = supabase.channel(channelName);
  // channel.on('broadcast', { event: 'emergency' }, callback).subscribe();
  // return channel;

  // For now, we'll return a mock unsubscribe function
  return () => {
    console.log(`Unsubscribed from ${channelName}`);
  };
}; 