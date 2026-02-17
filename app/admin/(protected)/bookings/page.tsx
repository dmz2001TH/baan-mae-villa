"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Calendar, Plus, Trash2, Edit, Home } from "lucide-react";
import { format } from "date-fns";

type Booking = {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  notes: string | null;
  createdAt: string;
  villa: {
    id: string;
    name: string;
    slug: string;
  };
};

type Villa = {
  id: string;
  name: string;
  slug: string;
};

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    villaId: "",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as { role?: string }).role === "ADMIN") {
      fetchData();
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings
      const bookingsRes = await fetch("/api/bookings");
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }

      // Fetch villas for dropdown
      const villasRes = await fetch("/api/villas");
      if (villasRes.ok) {
        const villasData = await villasRes.json();
        setVillas(Array.isArray(villasData) ? villasData : []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddForm(false);
        setFormData({ villaId: "", startDate: "", endDate: "", notes: "" });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (status !== "authenticated" || (session?.user as { role?: string }).role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900">
        <p className="text-white">Access denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-900/50 px-4 py-6 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <Home className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-white">Manage Bookings</h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 font-medium text-neutral-900 transition-colors hover:bg-amber-400"
          >
            <Plus className="h-5 w-5" />
            Add Booking
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        {/* Add Booking Form */}
        {showAddForm && (
          <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-800/50 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Add New Booking</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Villa
                </label>
                <select
                  value={formData.villaId}
                  onChange={(e) => setFormData({ ...formData, villaId: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white"
                  required
                >
                  <option value="">Select a villa</option>
                  {villas.map((villa) => (
                    <option key={villa.id} value={villa.id}>
                      {villa.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-amber-500 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-amber-400 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Booking"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bookings List */}
        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-neutral-500">
              <Calendar className="mx-auto h-12 w-12 mb-4" />
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-800/50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                      Villa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                      Start Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                      End Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-neutral-800/50 hover:bg-neutral-800/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/villas/${booking.villa.slug}`}
                          className="font-medium text-white hover:text-amber-400 transition-colors"
                        >
                          {booking.villa.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {format(new Date(booking.startDate), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {format(new Date(booking.endDate), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            booking.status === "BOOKED"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-400">
                        {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="rounded p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-red-400"
                          title="Delete booking"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
