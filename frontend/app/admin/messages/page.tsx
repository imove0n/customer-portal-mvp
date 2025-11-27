'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, MessageSquare, User } from 'lucide-react'

interface Message {
  id: number
  booking_id: number
  message: string
  sender_type: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  job_number: string
  service_type: string
}

interface GroupedMessages {
  [bookingId: number]: {
    bookingInfo: {
      job_number: string
      service_type: string
      customerName: string
    }
    messages: Message[]
  }
}

export default function AdminMessages() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [groupedMessages, setGroupedMessages] = useState<GroupedMessages>({})
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewedConversations, setViewedConversations] = useState<Set<number>>(new Set())

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token || !userStr) {
      router.push('/')
      return
    }

    const user = JSON.parse(userStr)
    if (user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchMessages(token)
  }, [router])

  const fetchMessages = async (token: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setMessages(data)
      groupMessagesByBooking(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setLoading(false)
    }
  }

  const groupMessagesByBooking = (msgs: Message[]) => {
    const grouped: GroupedMessages = {}

    msgs.forEach(msg => {
      if (!grouped[msg.booking_id]) {
        grouped[msg.booking_id] = {
          bookingInfo: {
            job_number: msg.job_number,
            service_type: msg.service_type,
            customerName: `${msg.first_name} ${msg.last_name}`
          },
          messages: []
        }
      }
      grouped[msg.booking_id].messages.push(msg)
    })

    // Sort messages within each booking by date
    Object.keys(grouped).forEach(bookingId => {
      grouped[Number(bookingId)].messages.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    })

    setGroupedMessages(grouped)
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedBooking) return

    setSending(true)
    const token = localStorage.getItem('token')

    try {
      const res = await fetch(`http://localhost:5000/api/admin/messages/${selectedBooking}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyText })
      })

      if (res.ok) {
        setReplyText('')
        // Refresh messages
        fetchMessages(token!)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-800 text-xl">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center text-gray-700 mb-4 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Message Center</h1>
          <p className="text-gray-600">View and respond to customer messages</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 max-h-[600px] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Conversations</h2>
            <div className="space-y-3">
              {Object.entries(groupedMessages).length === 0 ? (
                <p className="text-gray-500 text-center py-8">No messages yet</p>
              ) : (
                Object.entries(groupedMessages).map(([bookingId, data]) => {
                  const lastMessage = data.messages[data.messages.length - 1]
                  const bookingIdNum = Number(bookingId)
                  const isViewed = viewedConversations.has(bookingIdNum)
                  const unreadCount = isViewed ? 0 : data.messages.filter((m: Message) => m.sender_type === 'customer').length

                  return (
                    <button
                      key={bookingId}
                      onClick={() => {
                        setSelectedBooking(bookingIdNum)
                        setViewedConversations(prev => new Set(prev).add(bookingIdNum))
                      }}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedBooking === bookingIdNum
                          ? 'bg-gray-800 border-2 border-gray-900'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`font-semibold ${selectedBooking === bookingIdNum ? 'text-white' : 'text-gray-800'}`}>
                          {data.bookingInfo.customerName}
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className={`text-sm mb-1 ${selectedBooking === bookingIdNum ? 'text-gray-300' : 'text-gray-600'}`}>{data.bookingInfo.job_number}</div>
                      <div className={`text-xs truncate ${selectedBooking === bookingIdNum ? 'text-gray-400' : 'text-gray-500'}`}>{lastMessage.message}</div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            {selectedBooking ? (
              <div className="flex flex-col h-[550px]">
                <div className="border-b pb-4 mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {groupedMessages[selectedBooking]?.bookingInfo.customerName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {groupedMessages[selectedBooking]?.bookingInfo.job_number} - {groupedMessages[selectedBooking]?.bookingInfo.service_type}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {groupedMessages[selectedBooking]?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'support' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender_type === 'support'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-3 h-3" />
                          <span className="text-xs font-semibold">
                            {msg.sender_type === 'support' ? 'You (Support)' : `${msg.first_name} ${msg.last_name}`}
                          </span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.sender_type === 'support' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={sending || !replyText.trim()}
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[550px] text-gray-400">
                <MessageSquare className="w-16 h-16 mb-4" />
                <p>Select a conversation to view messages</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
