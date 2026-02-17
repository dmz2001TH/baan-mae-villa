"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { enUS, th, zhCN } from "date-fns/locale";
import { format } from "date-fns";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";

type Booking = {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
};

type Props = {
  villaId: string;
  onDateSelect?: (date: Date | undefined) => void;
  selectedDate?: Date;
  className?: string;
};

const LOCALES = {
  th: th,
  en: enUS,
  cn: zhCN,
};

export function AvailabilityCalendar({ 
  villaId, 
  onDateSelect, 
  selectedDate,
  className = "" 
}: Props) {
  const { locale } = useLocale();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [disabledDays, setDisabledDays] = useState<Date[]>([]);

  useEffect(() => {
    fetchBookings();
  }, [villaId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings?villaId=${villaId}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
        
        // Convert booking ranges to array of disabled days
        const bookedDays: Date[] = [];
        data.forEach((booking: Booking) => {
          const start = new Date(booking.startDate);
          const end = new Date(booking.endDate);
          
          // Add all days from start to end (inclusive)
          const current = new Date(start);
          while (current <= end) {
            bookedDays.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
        });
        
        setDisabledDays(bookedDays);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return true;
    }

    // Disable booked dates
    return disabledDays.some(
      (disabledDay) =>
        date.getDate() === disabledDay.getDate() &&
        date.getMonth() === disabledDay.getMonth() &&
        date.getFullYear() === disabledDay.getFullYear()
    );
  };

  const modifiers = {
    booked: disabledDays,
  };

  const modifiersStyles = {
    booked: {
      backgroundColor: "#ef4444",
      color: "white",
      opacity: 0.5,
      cursor: "not-allowed",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className={`availability-calendar ${className}`}>
      <div className="bg-neutral-900 rounded-xl border border-white/10 p-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t(locale, "availability_title")}
        </h3>
        
        <div className="mb-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neutral-700 rounded"></div>
            <span className="text-neutral-400">{t(locale, "available")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded opacity-50"></div>
            <span className="text-neutral-400">{t(locale, "booked")}</span>
          </div>
        </div>

        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          disabled={isDateDisabled}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          locale={LOCALES[locale as keyof typeof LOCALES]}
          className="rdp-neutral-900"
          styles={{
            root: {
              background: "transparent",
              color: "white",
            },
            head: {
              color: "#9ca3af",
            },
            head_row: {
              marginBottom: "0.5rem",
            },
            head_cell: {
              fontWeight: "500",
              textTransform: "uppercase",
              fontSize: "0.75rem",
              padding: "0.5rem",
            },
            row: {
              marginBottom: "0.25rem",
            },
            cell: {
              borderRadius: "0.375rem",
              padding: "0.5rem",
              textAlign: "center" as const,
              border: "1px solid transparent",
              transition: "all 0.2s",
            },
            day: {
              borderRadius: "0.375rem",
              padding: "0.5rem",
              transition: "all 0.2s",
            },
            day_today: {
              backgroundColor: "#f59e0b",
              color: "#000000",
              fontWeight: "bold",
            },
            day_selected: {
              backgroundColor: "#f59e0b",
              color: "#000000",
              fontWeight: "bold",
            },
            day_disabled: {
              opacity: "0.3",
              cursor: "not-allowed",
            },
            nav: {
              color: "white",
            },
            nav_button: {
              backgroundColor: "#374151",
              color: "white",
              borderRadius: "0.375rem",
              padding: "0.5rem",
              border: "1px solid #4b5563",
              transition: "all 0.2s",
            },
            nav_button_previous: {
              marginRight: "0.5rem",
            },
            nav_button_next: {
              marginLeft: "0.5rem",
            },
            caption: {
              color: "white",
              fontWeight: "500",
              marginBottom: "1rem",
            },
            caption_label: {
              fontSize: "1rem",
              fontWeight: "500",
            },
          }}
        />
        
        {selectedDate && (
          <div className="mt-4 p-3 bg-neutral-800 rounded-lg">
            <p className="text-sm text-neutral-300">
              {t(locale, "selected_date")}:{" "}
              <span className="text-amber-400 font-medium">
                {format(selectedDate, "PPP", { locale: LOCALES[locale as keyof typeof LOCALES] })}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
