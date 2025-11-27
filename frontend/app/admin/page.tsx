'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Users, Calendar, MessageSquare, ArrowRight } from 'lucide-react'

interface Stats {
  totalCustomers: number
  totalBookings: number
  totalMessages: number
  pendingBookings: number
}

interface RecentMessage {
  id: number
  message: string
  sender_type: string
  created_at: string
  first_name: string
  last_name: string
  job_number: string
  service_type: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([])
  const [loading, setLoading] = useState(true)

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

    fetchDashboardData(token)
  }, [router])

  const fetchDashboardData = async (token: string) => {
    try {
      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const statsData = await statsRes.json()
      setStats(statsData)

      // Fetch recent messages
      const messagesRes = await fetch('http://localhost:5000/api/admin/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const messagesData = await messagesRes.json()
      setRecentMessages(messagesData.slice(0, 5))

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-800 text-xl">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                router.push('/')
              }}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats?.totalCustomers || 0}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Customers</h3>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats?.totalBookings || 0}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Bookings</h3>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats?.totalMessages || 0}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Messages</h3>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats?.pendingBookings || 0}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Pending Bookings</h3>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/admin/messages')}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-200"
          >
            <MessageSquare className="w-8 h-8 text-gray-900 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Message Center</h3>
            <p className="text-gray-600 text-sm mb-4">View and respond to customer messages</p>
            <div className="flex items-center text-gray-900 font-medium">
              Go to Messages <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/bookings')}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-200"
          >
            <Calendar className="w-8 h-8 text-gray-900 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Manage Bookings</h3>
            <p className="text-gray-600 text-sm mb-4">Create, edit, and manage all bookings</p>
            <div className="flex items-center text-gray-900 font-medium">
              Go to Bookings <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/customers')}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-200"
          >
            <Users className="w-8 h-8 text-gray-900 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">View Customers</h3>
            <p className="text-gray-600 text-sm mb-4">See all registered customers</p>
            <div className="flex items-center text-gray-900 font-medium">
              Go to Customers <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Messages</h2>
          <div className="space-y-4">
            {recentMessages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No messages yet</p>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">
                          {msg.first_name} {msg.last_name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          msg.sender_type === 'customer'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-gray-900 text-white'
                        }`}>
                          {msg.sender_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{msg.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{msg.job_number}</span>
                        <span>{msg.service_type}</span>
                        <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentMessages.length > 0 && (
            <button
              onClick={() => router.push('/admin/messages')}
              className="mt-4 w-full py-2 text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              View All Messages
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
