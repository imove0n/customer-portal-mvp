'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminGetAllBookings, adminGetAllCustomers, adminCreateBooking, adminUpdateBooking, adminDeleteBooking } from '@/lib/api';
import { ArrowLeft, Plus, Edit, Trash2, X, CheckCircle } from 'lucide-react';

interface Customer {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
}

interface Booking {
  id: number;
  user_id: number;
  job_number: string;
  status: string;
  service_type: string;
  scheduled_date: string;
  description: string;
  total_amount: number;
  address: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    jobNumber: '',
    status: 'Scheduled',
    serviceType: '',
    scheduledDate: '',
    description: '',
    totalAmount: '',
    address: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsData, customersData] = await Promise.all([
        adminGetAllBookings(),
        adminGetAllCustomers(),
      ]);
      setBookings(bookingsData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      userId: '',
      jobNumber: `JOB-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: 'Scheduled',
      serviceType: '',
      scheduledDate: '',
      description: '',
      totalAmount: '',
      address: '',
    });
    setShowModal(true);
  };

  const handleEdit = (booking: Booking) => {
    setModalMode('edit');
    setSelectedBooking(booking);
    setFormData({
      userId: booking.user_id.toString(),
      jobNumber: booking.job_number,
      status: booking.status,
      serviceType: booking.service_type,
      scheduledDate: booking.scheduled_date,
      description: booking.description || '',
      totalAmount: booking.total_amount?.toString() || '',
      address: booking.address || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      await adminDeleteBooking(id.toString());
      setBookings(bookings.filter(b => b.id !== id));
      alert('Booking deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete booking');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bookingData = {
      userId: parseInt(formData.userId),
      jobNumber: formData.jobNumber,
      status: formData.status,
      serviceType: formData.serviceType,
      scheduledDate: formData.scheduledDate,
      description: formData.description,
      totalAmount: parseFloat(formData.totalAmount) || 0,
      address: formData.address,
    };

    try {
      if (modalMode === 'create') {
        const newBooking = await adminCreateBooking(bookingData);
        setBookings([newBooking, ...bookings]);
        setSuccessMessage('Booking created successfully!');
      } else {
        const updated = await adminUpdateBooking(selectedBooking!.id.toString(), bookingData);
        setBookings(bookings.map(b => b.id === updated.id ? updated : b));
        setSuccessMessage('Booking updated successfully!');
      }
      setShowModal(false);
      setShowSuccessAlert(true);
      fetchData(); // Refresh to get customer info

      // Auto-hide alert after 4 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 4000);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Admin Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
              <p className="text-gray-600 mt-1">Create, edit, and manage all customer bookings</p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              <Plus className="w-5 h-5" />
              New Booking
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.job_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {booking.first_name} {booking.last_name}
                      <br />
                      <span className="text-xs text-gray-500">{booking.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {booking.service_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {booking.scheduled_date ? new Date(booking.scheduled_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      ${booking.total_amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(booking)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-primary-950 bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-slide-in">
            <div className="glass-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-primary-700">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-1">
                      {modalMode === 'create' ? 'Create New Booking' : 'Edit Booking'}
                    </h2>
                    <p className="text-slate-500 text-sm">
                      {modalMode === 'create' ? 'Add a new service booking for a customer' : 'Update booking information'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Select */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Customer <span className="text-coral-500">*</span>
                    </label>
                    <select
                      value={formData.userId}
                      onChange={(e) => setFormData({...formData, userId: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 bg-white hover:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent transition-all shadow-sm"
                      required
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.first_name} {customer.last_name} - {customer.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Job Number */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Job Number <span className="text-coral-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.jobNumber}
                        onChange={(e) => setFormData({...formData, jobNumber: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 bg-white hover:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent transition-all shadow-sm"
                        required
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Status <span className="text-coral-500">*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 bg-white hover:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent transition-all shadow-sm"
                        required
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Service Type */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Service Type <span className="text-coral-500">*</span>
                      </label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 bg-white hover:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent transition-all shadow-sm"
                        required
                      >
                        <option value="">Select service type</option>
                        <option value="Plumbing Repair">Plumbing Repair</option>
                        <option value="HVAC Maintenance">HVAC Maintenance</option>
                        <option value="Electrical Work">Electrical Work</option>
                        <option value="General Maintenance">General Maintenance</option>
                        <option value="Cleaning Service">Cleaning Service</option>
                        <option value="Landscaping">Landscaping</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Scheduled Date */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Scheduled Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 bg-white hover:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Total Amount */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Total Amount ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 bg-white hover:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent transition-all shadow-sm"
                        placeholder="0.00"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 bg-white hover:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent transition-all shadow-sm"
                        placeholder="123 Main St"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-800 bg-white hover:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent transition-all resize-none shadow-sm"
                      rows={4}
                      placeholder="Describe the service..."
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-slate-200 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-mint-400 to-mint-500 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-mint-500 hover:to-mint-600 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {modalMode === 'create' ? 'Create Booking' : 'Update Booking'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3.5 px-6 rounded-xl hover:bg-slate-200 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert Toast */}
        {showSuccessAlert && (
          <div className="fixed top-8 right-8 z-[60] animate-slide-in">
            <div className="glass-card rounded-2xl p-6 shadow-2xl border-2 border-mint-400 min-w-[400px]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-mint-400 to-mint-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Success!</h3>
                  <p className="text-slate-600">{successMessage}</p>
                </div>
                <button
                  onClick={() => setShowSuccessAlert(false)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-mint-400 to-mint-500 rounded-full animate-progress" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
