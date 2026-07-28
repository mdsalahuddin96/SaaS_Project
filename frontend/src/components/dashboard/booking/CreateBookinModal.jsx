'use client';

import { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Mail, Phone, Briefcase, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { createBooking } from '@/lib/api/bookings';


export default function CreateBookingModal({ isOpen, onClose, subdomain, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    serviceName: '',
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
    notes: '',
  });

  if (!isOpen) return null;
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Basic Client-Side Validation
    if (!formData.customerName.trim()) return toast.error('Customer name is required');
    if (!formData.customerEmail.trim()) return toast.error('Customer email is required');
    if (!formData.serviceName.trim()) return toast.error('Service name is required');
    if (!formData.bookingDate) return toast.error('Booking date is required');

    // Time Validation (Start time cannot be after end time)
    if (formData.startTime >= formData.endTime) {
      return toast.error('End time must be after start time');
    }

    try {
      setLoading(true);
      
      // 2. API Call (Idempotency Key auto-generated inside booking.js)
      await createBooking(subdomain, formData);
      
      toast.success('Booking created successfully!');
      onSuccess(); // Refresh the list
      onClose();   // Close modal
    } catch (error) {
      // Standard Error response handling
      if (error.details && error.details.length > 0) {
        error.details.forEach((err) => toast.error(`${err.field}: ${err.message}`));
      } else {
        toast.error(error.message || 'Failed to create booking');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-white">Create New Booking</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Service Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Service Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="serviceName"
                placeholder="e.g. Health Checkup / Gym Session"
                value={formData.serviceName}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Customer Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="customerName"
                  placeholder="John Doe"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="customerEmail"
                  placeholder="john@example.com"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Customer Phone & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="customerPhone"
                  placeholder="+8801700..."
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Initial Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Date, Start Time & End Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 p-2 focus:outline-none focus:border-indigo-500"
                required
              />
              
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 p-2 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 p-2 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes (Optional)</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <textarea
                name="notes"
                rows="2"
                placeholder="Any special requests..."
                value={formData.notes}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium rounded-lg text-sm transition-all shadow-md shadow-indigo-600/20"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}