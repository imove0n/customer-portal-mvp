export interface User {
  id: number;
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  servicem8_uuid?: string;
  job_number: string;
  status: string;
  service_type: string;
  scheduled_date: string;
  completed_date?: string;
  description: string;
  total_amount: number;
  address: string;
  created_at: string;
}

export interface Message {
  id: number;
  booking_id: number;
  user_id: number;
  message: string;
  sender_type: 'customer' | 'support';
  created_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface Attachment {
  id: number;
  booking_id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}
