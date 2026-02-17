"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  villaName?: string;
  image?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "ธีระชัย ใจดี",
    location: "กรุงเทพมหานคร",
    rating: 5,
    comment: "วิลล่าสวยงามมาก บริการดีเป็นกันเอง วิวทะเลสวยงาม สระว่ายน้ำส่วนตัวใหญ่มาก ครอบครัวชอบมากๆ จะกลับมาพักอีกแน่นอน",
    date: "2024-01-15",
    villaName: "Sea View Villa",
  },
  {
    id: "2",
    name: "Michael Chen",
    location: "ฮ่องกง",
    rating: 5,
    comment: "Amazing villa with stunning ocean views! The host was very helpful and the location is perfect. Private pool was clean and well-maintained. Highly recommend!",
    date: "2024-01-10",
    villaName: "Luxury Beach Villa",
  },
  {
    id: "3",
    name: "สมชาติ สุขใจ",
    location: "เชียงใหม่",
    rating: 4,
    comment: "สถานที่ดี สะดวกสบาย ใกล้แหล่งช้อปปิ้ง วิลล่าสวยงาม น้ำทะเลสวยงาม เหมาะสำหรับพักผ่อนครอบครัว",
    date: "2024-01-05",
    villaName: "Sunset Villa",
  },
  {
    id: "4",
    name: "Sarah Johnson",
    location: "ลอนดอน",
    rating: 5,
    comment: "Perfect vacation spot! The villa exceeded our expectations. Clean, spacious, and beautifully decorated. The beach is just a short walk away. Will definitely come back!",
    date: "2023-12-28",
    villaName: "Paradise Villa",
  },
  {
    id: "5",
    name: "วีระพล มีชัย",
    location: "ขอนแก่น",
    rating: 5,
    comment: "บรรยากาศดีมาก วิลล่าใหญ่สะดวกสบาย มีทุกอย่างครบครัน พนักงานดูแลดีมาก แนะนำเลยครับ",
    date: "2023-12-20",
    villaName: "Ocean Paradise",
  },
];

export function Testimonials() {
  const { locale } = useLocale();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-16 bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {locale === "th" ? "ความประทับใจจากลูกค้า" : locale === "cn" ? "客户评价" : "Customer Testimonials"}
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            {locale === "th" 
              ? "ลูกค้าของเราพูดถึงประสบการณ์การพักผ่อนกับเรา" 
              : locale === "cn" 
              ? "客户分享他们的住宿体验" 
              : "Our customers share their experience staying with us"}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main testimonial card */}
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-neutral-800 p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Quote icon */}
              <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 flex-shrink-0">
                <Quote className="w-10 h-10 text-amber-500" />
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                {/* Rating */}
                <div className="flex justify-center md:justify-start gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < current.rating ? "text-amber-400 fill-current" : "text-neutral-600"
                      }`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <blockquote className="text-lg md:text-xl text-white mb-6 italic">
                  "{current.comment}"
                </blockquote>

                {/* Author info */}
                <div>
                  <div className="font-semibold text-white">{current.name}</div>
                  <div className="text-neutral-400 text-sm">{current.location}</div>
                  {current.villaName && (
                    <div className="text-amber-400 text-sm mt-1">
                      {locale === "th" ? "พักที่" : locale === "cn" ? "入住" : "Stayed at"} {current.villaName}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full p-2 shadow-lg transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full p-2 shadow-lg transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-amber-400 w-8"
                  : "bg-neutral-600 hover:bg-neutral-500"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-amber-400">500+</div>
            <div className="text-neutral-400 text-sm mt-1">
              {locale === "th" ? "ลูกค้าพึงพอใจ" : locale === "cn" ? "满意客户" : "Happy Customers"}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-400">4.9</div>
            <div className="text-neutral-400 text-sm mt-1">
              {locale === "th" ? "คะแนนเฉลี่ย" : locale === "cn" ? "平均评分" : "Average Rating"}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-400">10+</div>
            <div className="text-neutral-400 text-sm mt-1">
              {locale === "th" ? "วิลล่าหรู" : locale === "cn" ? "豪华别墅" : "Luxury Villas"}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-400">98%</div>
            <div className="text-neutral-400 text-sm mt-1">
              {locale === "th" ? "กลับมาพักอีก" : locale === "cn" ? "再次入住" : "Return Rate"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
