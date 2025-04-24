export type EventStatus = "scheduled" | "canceled" | "completed" | "postponed";
export type EventVisibility = "public" | "private" | "members";
export type EventCategory = 
  | "mass" 
  | "prayer" 
  | "sacrament" 
  | "catechesis" 
  | "charity" 
  | "meeting" 
  | "celebration" 
  | "retreat" 
  | "other";

export type EventRecurrence = 
  | "none" 
  | "daily" 
  | "weekly" 
  | "biweekly" 
  | "monthly" 
  | "yearly";

export interface EventLocation {
  name: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isOnline: boolean;
  meetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
}

export interface EventOrganizer {
  id: string;
  name: string;
  role?: string;
  contactInfo?: string;
}

export interface EventAttendee {
  id: string;
  name: string;
  email: string;
  status: "confirmed" | "pending" | "declined" | "waitlist";
  registrationDate: string;
  notes?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
}

export interface EventResource {
  id: string;
  name: string;
  type: "document" | "image" | "video" | "link";
  url: string;
  description?: string;
}

export interface EventReminder {
  id: string;
  type: "email" | "notification" | "sms";
  timeBeforeEvent: number; // in minutes
  message?: string;
  sent: boolean;
  sentAt?: string;
}

export interface Event {
  id: string;
  parishId: string;
  title: string;
  description: string;
  shortDescription?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location: EventLocation;
  category: EventCategory;
  status: EventStatus;
  visibility: EventVisibility;
  maxAttendees?: number;
  requireRegistration: boolean;
  allowCancellation: boolean;
  cancellationDeadline?: string; // ISO date string
  image?: string;
  recurrence: EventRecurrence;
  recurrenceEndDate?: string;
  organizers: EventOrganizer[];
  resources: EventResource[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  featured: boolean;
  allowComments: boolean;
  allowSharing: boolean;
  reminders: EventReminder[];
}

export interface EventAttendance {
  eventId: string;
  attendees: EventAttendee[];
  waitlist: EventAttendee[];
  totalConfirmed: number;
  totalPending: number;
  totalDeclined: number;
  totalWaitlist: number;
}

export interface EventComment {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string;
  likes: number;
  likedBy: string[];
}

export interface EventFormData {
  title: string;
  description: string;
  shortDescription?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location: EventLocation;
  category: EventCategory;
  status: EventStatus;
  visibility: EventVisibility;
  maxAttendees?: number;
  requireRegistration: boolean;
  allowCancellation: boolean;
  cancellationDeadline?: string;
  image?: string;
  recurrence: EventRecurrence;
  recurrenceEndDate?: string;
  organizers: EventOrganizer[];
  resources: EventResource[];
  tags: string[];
  featured: boolean;
  allowComments: boolean;
  allowSharing: boolean;
  reminders: EventReminder[];
}

export interface EventFilters {
  startDate?: string;
  endDate?: string;
  categories?: EventCategory[];
  status?: EventStatus[];
  featured?: boolean;
  search?: string;
  tags?: string[];
}
