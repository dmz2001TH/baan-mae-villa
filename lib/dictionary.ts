/**
 * Static content dictionary for sections that need full i18n support.
 * These serve as default/fallback text — the SiteContent model in DB
 * can override them via the EditableText component.
 */

import type { Locale } from "./i18n";

type LocaleText = Record<Locale, string>;

// ——— Why Choose Us Section ———
export const WHY_CHOOSE_US_TITLE: LocaleText = {
  th: "ทำไมต้องเลือกเรา",
  en: "Why Choose Us",
  cn: "为何选择我们",
};

export const WHY_CHOOSE_US_ITEMS: {
  titleKey: string;
  titleDefault: LocaleText;
  descKey: string;
  descDefault: LocaleText;
}[] = [
  {
    titleKey: "why_us_1_title",
    titleDefault: {
      th: "ดีไซน์หรูสไตล์โมเดิร์น",
      en: "Modern Luxury Design",
      cn: "现代奢华设计",
    },
    descKey: "why_us_1_desc",
    descDefault: {
      th: "ผสมผสานสไตล์ Nordic และ Moroccan พร้อมเพดานสูง Double Volume ให้ความรู้สึกโปร่งโล่งและหรูหราทุกมุมมอง",
      en: "A blend of Nordic & Moroccan styles with soaring double-volume ceilings — spacious, airy, and luxurious in every detail.",
      cn: "融合北欧与摩洛哥风格，配以挑高客厅设计，每一处细节都彰显奢华与宽敞。",
    },
  },
  {
    titleKey: "why_us_2_title",
    titleDefault: {
      th: "เฟอร์นิเจอร์ครบ พร้อมเข้าอยู่",
      en: "Fully Furnished & Move-in Ready",
      cn: "精装交付 拎包入住",
    },
    descKey: "why_us_2_desc",
    descDefault: {
      th: "ทุกหลังพร้อมเฟอร์นิเจอร์บิลท์อิน เครื่องใช้ไฟฟ้า สระจากุซซี่ส่วนตัว และครัวยุโรป — พร้อมเข้าอยู่หรือปล่อยเช่าได้ทันที",
      en: "Every unit comes with built-in furniture, appliances, a private Jacuzzi pool, and European kitchen — ready to live in or rent out immediately.",
      cn: "每套配备全屋定制家具、家电、私人按摩泳池和欧式厨房——即可入住或出租。",
    },
  },
  {
    titleKey: "why_us_3_title",
    titleDefault: {
      th: "ความเป็นส่วนตัวสูงสุด",
      en: "Maximum Privacy",
      cn: "极致私密",
    },
    descKey: "why_us_3_desc",
    descDefault: {
      th: "โครงการ Low-Density เพียงไม่กี่หลัง พร้อมระบบรักษาความปลอดภัย 24 ชม. ให้คุณใช้ชีวิตอย่างสงบและปลอดภัย",
      en: "A low-density community with only a handful of residences and 24/7 security — peaceful, exclusive living at its finest.",
      cn: "低密度社区，仅有少量住宅，配备24小时安保——享受宁静与尊贵的生活体验。",
    },
  },
];

// ——— Footer ———
export const FOOTER_COPYRIGHT: LocaleText = {
  th: "Baan Mae Villa. สงวนลิขสิทธิ์.",
  en: "Baan Mae Villa. All rights reserved.",
  cn: "Baan Mae Villa. 版权所有。",
};

/**
 * Helper: get text for current locale from a LocaleText object.
 */
export function d(texts: LocaleText, locale: Locale): string {
  return texts[locale] ?? texts.en;
}
