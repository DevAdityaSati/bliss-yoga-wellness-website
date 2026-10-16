import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ContactMessage, ContactStatus } from '../types';

const LOCAL_STORAGE_CONTACTS = 'bliss_yoga_contacts_db';

const INITIAL_CONTACTS: ContactMessage[] = [
  {
    id: 'cnt-101',
    name: 'Emily Watson',
    email: 'emily.watson@example.com',
    subject: 'Question about Private Online Coaching',
    message: 'Hello! I have a prior wrist injury and would like to know if the 1-on-1 private sessions can be tailored for non-weight bearing poses.',
    status: 'unread',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'cnt-102',
    name: 'Hiroshi Tanaka',
    email: 'hiroshi.tanaka@example.com',
    subject: 'Corporate Wellness Workshops',
    message: 'We are interested in booking a weekly online Chair Yoga session for our remote tech team across Japan and Singapore.',
    status: 'read',
    reply_notes: 'Replied via email with corporate package details.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

function getLocalContacts(): ContactMessage[] {
  const data = localStorage.getItem(LOCAL_STORAGE_CONTACTS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_CONTACTS, JSON.stringify(INITIAL_CONTACTS));
    return INITIAL_CONTACTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_CONTACTS;
  }
}

function saveLocalContacts(contacts: ContactMessage[]) {
  localStorage.setItem(LOCAL_STORAGE_CONTACTS, JSON.stringify(contacts));
}

export async function submitContactForm(
  contact: Omit<ContactMessage, 'id' | 'created_at' | 'status'>
): Promise<{ message: ContactMessage; error?: string }> {
  const newMessage: ContactMessage = {
    ...contact,
    id: 'cnt-' + Date.now(),
    status: 'unread',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          message: contact.message,
          status: 'unread',
        }])
        .select()
        .single();

      if (!error && data) {
        const local = getLocalContacts();
        local.unshift(data as ContactMessage);
        saveLocalContacts(local);
        return { message: data as ContactMessage };
      }
    } catch (e) {
      console.warn('Supabase submit contact error:', e);
    }
  }

  const local = getLocalContacts();
  local.unshift(newMessage);
  saveLocalContacts(local);
  return { message: newMessage };
}

export async function getAllContacts(): Promise<ContactMessage[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        saveLocalContacts(data as ContactMessage[]);
        return data as ContactMessage[];
      }
    } catch (e) {
      console.warn('Supabase fetch contacts error:', e);
    }
  }

  return getLocalContacts();
}

export async function updateContactStatus(
  id: string,
  status: ContactStatus,
  replyNotes?: string
): Promise<ContactMessage | null> {
  const updates: Partial<ContactMessage> = { status };
  if (replyNotes !== undefined) updates.reply_notes = replyNotes;

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('contact_messages').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase update contact error:', e);
    }
  }

  const local = getLocalContacts();
  const idx = local.findIndex(c => c.id === id);
  if (idx !== -1) {
    local[idx] = { ...local[idx], ...updates };
    saveLocalContacts(local);
    return local[idx];
  }
  return null;
}
