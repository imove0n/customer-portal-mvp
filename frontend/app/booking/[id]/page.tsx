'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getBooking, getAttachments, getMessages, sendMessage } from '@/lib/api';
import { Booking, Attachment, Message } from '@/lib/types';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  Download,
  Image as ImageIcon,
  Send,
  User,
  Clock,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    if (params.id) {
      fetchBookingDetails();
    }
  }, [params.id, router]);

  const fetchBookingDetails = async () => {
    try {
      const [bookingData, attachmentsData, messagesData] = await Promise.all([
        getBooking(params.id as string),
        getAttachments(params.id as string),
        getMessages(params.id as string),
      ]);

      setBooking(bookingData);
      setAttachments(attachmentsData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to fetch booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    try {
      const sentMessage = await sendMessage(params.id as string, messageText);
      // Immediately add the message to the UI
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-mint-500/20 text-mint-600 border-mint-500';
      case 'In Progress':
        return 'bg-coral-500/20 text-coral-600 border-coral-500';
      case 'Scheduled':
        return 'bg-blue-500/20 text-blue-600 border-blue-500';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = (fileType: string) => {
    return fileType?.startsWith('image/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Booking not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-6 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-primary-950 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-primary-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Booking Details</h1>
              <p className="text-primary-200 text-sm">{booking.job_number}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Overview */}
            <div className="glass-card rounded-xl p-6 animate-slide-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{booking.service_type}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Total Amount</p>
                  <p className="text-3xl font-bold text-mint-600">${booking.total_amount.toFixed(2)}</p>
                </div>
              </div>

              <p className="text-slate-600 mb-6">{booking.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Job Number</p>
                    <p className="font-semibold text-slate-800">{booking.job_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-coral-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Scheduled Date</p>
                    <p className="font-semibold text-slate-800">
                      {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-mint-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="font-semibold text-slate-800">{booking.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Created</p>
                    <p className="font-semibold text-slate-800">
                      {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="glass-card rounded-xl p-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-mint-500" />
                Attachments ({attachments.length})
              </h3>

              {attachments.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No attachments available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-all"
                    >
                      {isImage(attachment.file_type) ? (
                        <div className="relative w-full h-40 mb-3 bg-slate-100 rounded-lg overflow-hidden">
                          <Image
                            src={attachment.file_url}
                            alt={attachment.file_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-40 mb-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                          <FileText className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                      <p className="font-medium text-slate-800 text-sm truncate">{attachment.file_name}</p>
                      <p className="text-xs text-slate-500 mb-2">{formatFileSize(attachment.file_size)}</p>
                      <a
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-mint-500 hover:bg-mint-600 text-white rounded-lg transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Messages */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-xl p-6 animate-slide-in sticky top-8" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-coral-500" />
                Messages
              </h3>

              {/* Messages List */}
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Send className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No messages yet</p>
                  </div>
                ) : (
                  messages.filter(message => message).map((message, index) => (
                    <div
                      key={message.id || `msg-${index}`}
                      className={`p-3 rounded-lg ${
                        message.sender_type === 'customer'
                          ? 'bg-mint-500 text-white ml-4'
                          : 'bg-slate-100 text-slate-800 mr-4'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3 h-3" />
                        <span className="text-xs font-semibold">
                          {message.sender_type === 'customer' ? 'You' : 'Support'}
                        </span>
                        <span className="text-xs opacity-75">
                          {format(new Date(message.created_at), 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent text-slate-800"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-mint-400 to-mint-500 text-white rounded-lg hover:from-mint-500 hover:to-mint-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
