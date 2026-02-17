"use client";

export const PRICE_MIN = 0;
export const PRICE_MAX = 150_000_000; // 150M THB
export const PRICE_STEP = 500_000;

function formatPrice(value: number): string {
  if (value >= PRICE_MAX) return "";
  return value.toLocaleString("en-US");
}

type Props = {
  value: number;
  onChange: (v: number) => void;
  label?: string;
};

export function MaxPriceSlider({ value, onChange, label = "Max budget" }: Props) {
  const display =
    value <= PRICE_MIN || value >= PRICE_MAX ? "—" : `฿${formatPrice(value)}`;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-amber-400/80">
        <span>{label}</span>
        <span className="font-medium text-white">{display}</span>
      </div>
      <input
        type="range"
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={PRICE_STEP}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full appearance-none rounded-full bg-neutral-800 accent-amber-400 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-amber-400/30"
      />
    </div>
  );
}
