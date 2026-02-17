"use client";

import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import { formatPrice } from "@/lib/currency";

type Props = {
  price: number;
  locale: "th" | "en" | "cn";
};

const LABELS: Record<string, Record<string, string>> = {
  title: { th: "คำนวณยอดผ่อนต่อเดือน", en: "Mortgage Calculator", cn: "月供计算器" },
  down_payment: { th: "เงินดาวน์ (%)", en: "Down Payment (%)", cn: "首付 (%)" },
  interest: { th: "ดอกเบี้ย (%/ปี)", en: "Interest (%/year)", cn: "利率 (%/年)" },
  years: { th: "จำนวนปี", en: "Loan Term (years)", cn: "贷款年限" },
  monthly: { th: "ยอดผ่อนต่อเดือน", en: "Monthly Payment", cn: "每月还款" },
  loan_amount: { th: "ยอดกู้", en: "Loan Amount", cn: "贷款金额" },
  total_interest: { th: "ดอกเบี้ยรวม", en: "Total Interest", cn: "总利息" },
};

function label(key: string, locale: string): string {
  return LABELS[key]?.[locale] ?? LABELS[key]?.en ?? key;
}

function formatMoney(n: number): string {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function MortgageCalculator({ price, locale }: Props) {
  const [downPercent, setDownPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanYears, setLoanYears] = useState(25);
  const [open, setOpen] = useState(false);

  const result = useMemo(() => {
    const downPayment = price * (downPercent / 100);
    const loanAmount = price - downPayment;
    if (loanAmount <= 0 || loanYears <= 0) {
      return { monthly: 0, loanAmount: 0, totalInterest: 0 };
    }
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanYears * 12;

    let monthly: number;
    if (monthlyRate === 0) {
      monthly = loanAmount / totalMonths;
    } else {
      monthly =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const totalPaid = monthly * totalMonths;
    const totalInterest = totalPaid - loanAmount;

    return { monthly, loanAmount, totalInterest };
  }, [price, downPercent, interestRate, loanYears]);

  return (
    <div className="rounded-xl border border-amber-400/20 bg-neutral-900/80">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-amber-400">
          <Calculator className="h-4 w-4" />
          {label("title", locale)}
        </span>
        <span className="text-xs text-neutral-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-white/10 px-5 pb-5 pt-4">
          {/* Down Payment */}
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">
              {label("down_payment", locale)}: {downPercent}%
            </label>
            <input
              type="range"
              min={0}
              max={80}
              step={5}
              value={downPercent}
              onChange={(e) => setDownPercent(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-neutral-600">
              <span>0%</span>
              <span>80%</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">
              {label("interest", locale)}: {interestRate.toFixed(1)}%
            </label>
            <input
              type="range"
              min={1}
              max={15}
              step={0.25}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-neutral-600">
              <span>1%</span>
              <span>15%</span>
            </div>
          </div>

          {/* Loan Years */}
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-400">
              {label("years", locale)}: {loanYears} {locale === "th" ? "ปี" : locale === "cn" ? "年" : "yrs"}
            </label>
            <input
              type="range"
              min={5}
              max={35}
              step={1}
              value={loanYears}
              onChange={(e) => setLoanYears(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-neutral-600">
              <span>5</span>
              <span>35</span>
            </div>
          </div>

          {/* Result */}
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-4 text-center">
            <p className="text-xs text-neutral-400">{label("monthly", locale)}</p>
            <p className="mt-1 text-2xl font-bold text-amber-400">
              {formatPrice(result.monthly, locale)}
            </p>
            <div className="mt-3 flex justify-between text-xs text-neutral-500">
              <div>
                <p>{label("loan_amount", locale)}</p>
                <p className="font-medium text-neutral-300">{formatPrice(result.loanAmount, locale)}</p>
              </div>
              <div>
                <p>{label("total_interest", locale)}</p>
                <p className="font-medium text-neutral-300">{formatPrice(result.totalInterest, locale)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
