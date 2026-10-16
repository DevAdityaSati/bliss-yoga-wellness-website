import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { NotificationItem } from '../types';

const LOCAL_STORAGE_NOTIFS = 'bliss_yoga_notifications_db';

const INITIAL_NOTIFS: NotificationItem[] = [
  {
    id: 'ntf-01',
    user_id: 'usr-student-101',
    title: 'Booking Approved!',
    message: 'Your Hatha Yoga Private Session has been approved for this Thursday at 10:00 AM.',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'ntf-02',
    user_id: 'usr-student-101',
    title: 'Welcome to Bliss Yoga!',
    message: 'Thank you for joining our global online yoga community. Your journey begins here.',
    is_read: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

function getLocalNotifs(): NotificationItem[] {
  const data = localStorage.getItem(LOCAL_STORAGE_NOTIFS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_NOTIFS, JSON.stringify(INITIAL_NOTIFS));
    return INITIAL_NOTIFS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_NOTIFS;
  }
}

function saveLocalNotifs(notifs: NotificationItem[]) {
  localStorage.setItem(LOCAL_STORAGE_NOTIFS, JSON.stringify(notifs));
}

export async function getUserNotifications(userId: string): Promise<NotificationItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as NotificationItem[];
      }
    } catch (e) {
      console.warn('Supabase fetch notifications error:', e);
    }
  }

  const local = getLocalNotifs();
  return local.filter(n => n.user_id === userId);
}

export async function markNotificationAsRead(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } catch (e) {
      console.warn('Supabase update notification error:', e);
    }
  }

  const local = getLocalNotifs();
  const idx = local.findIndex(n => n.id === id);
  if (idx !== -1) {
    local[idx].is_read = true;
    saveLocalNotifs(local);
  }
}

export async function sendUserNotification(
  userId: string,
  title: string,
  message: string
): Promise<NotificationItem> {
  const newNotif: NotificationItem = {
    id: 'ntf-' + Date.now(),
    user_id: userId,
    title,
    message,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('notifications').insert([{
        user_id: userId,
        title,
        message,
        is_read: false,
      }]);
    } catch (e) {
      console.warn('Supabase send notification error:', e);
    }
  }

  const local = getLocalNotifs();
  local.unshift(newNotif);
  saveLocalNotifs(local);
  return newNotif;
}
