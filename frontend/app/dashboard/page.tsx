'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBookings } from '@/lib/api';
import { Booking, User } from '@/lib/types';
import { Calendar, DollarSign, MapPin, Package, LogOut, Search, Filter, FileText, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(userData));
    fetchBookings();
  }, [router]);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, statusFilter, bookings]);

  const fetchBookings = async () => {
    try {
      const data = await getBookings();
      setBookings(data);
      setFilteredBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
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

  const statuses = ['All', 'Scheduled', 'In Progress', 'Completed'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-primary-950 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-mint-400 to-coral-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Customer Portal</h1>
                <p className="text-primary-200 text-sm">Welcome back, {user?.firstName || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard/servicem8')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">ServiceM8 Test</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-800 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 animate-slide-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{bookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-mint-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {bookings.filter((b) => b.status === 'In Progress').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-coral-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Spent</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  ${bookings.reduce((sum, b) => sum + b.total_amount, 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by job number, service type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent transition"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-slate-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full sm:w-48 pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent transition appearance-none"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Bookings</h2>

          {filteredBookings.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No bookings found</p>
              <p className="text-slate-400 text-sm mt-2">
                {searchTerm || statusFilter !== 'All'
                  ? 'Try adjusting your filters'
                  : 'Your bookings will appear here'}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking, index) => (
              <div
                key={booking.id}
                onClick={() => router.push(`/booking/${booking.id}`)}
                className="glass-card rounded-xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 animate-slide-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-800">{booking.service_type}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-3">{booking.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{booking.job_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center gap-2">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Total Amount</p>
                      <p className="text-2xl font-bold text-mint-600">${booking.total_amount.toFixed(2)}</p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-mint-400 to-mint-500 text-white rounded-lg hover:from-mint-500 hover:to-mint-600 transition-all font-medium text-sm shadow-md">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
