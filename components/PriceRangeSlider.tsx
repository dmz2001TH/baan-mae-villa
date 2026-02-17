"use client";

const PRICE_MIN = 0;
const PRICE_MAX = 150_000_000; // 150M THB
const PRICE_STEP = 500_000;

function formatPrice(value: number): string {
  if (value >= PRICE_MAX) return "";
  return value.toLocaleString("en-US");
}

type Props = {
  minValue: number;
  maxValue: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
  minLabel?: string;
  maxLabel?: string;
};

export function PriceRangeSlider({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minLabel = "Min",
  maxLabel = "Max",
}: Props) {
  const minP = Math.min(minValue, maxValue);
  const maxP = Math.max(minValue, maxValue);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-neutral-400">
        <span>
          {minLabel}: {minP >= PRICE_MAX ? "—" : `฿${formatPrice(minP)}`}
        </span>
        <span>
          {maxLabel}: {maxP >= PRICE_MAX ? "—" : `฿${formatPrice(maxP)}`}
        </span>
      </div>
      <div className="relative flex gap-2">
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={minP}
          onChange={(e) => onMinChange(Number(e.target.value))}
          className="h-2 w-full appearance-none rounded-full bg-neutral-700 accent-yellow-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-500 [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={maxP}
          onChange={(e) => onMaxChange(Number(e.target.value))}
          className="h-2 w-full appearance-none rounded-full bg-neutral-700 accent-yellow-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-500 [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>
    </div>
  );
}

export { PRICE_MIN, PRICE_MAX, PRICE_STEP };
