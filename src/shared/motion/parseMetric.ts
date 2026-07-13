export interface ParsedMetric {
  prefix: string;
  number: number;
  suffix: string;
  decimals: number;
  useCommas: boolean;
}

const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const EXTENDED_ARABIC_INDIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function normalizeDigits(raw: string): string {
  return raw
    .split("")
    .map((char) => {
      const arabicIndex = ARABIC_INDIC_DIGITS.indexOf(char);
      if (arabicIndex >= 0) return String(arabicIndex);
      const extendedIndex = EXTENDED_ARABIC_INDIC_DIGITS.indexOf(char);
      if (extendedIndex >= 0) return String(extendedIndex);
      return char;
    })
    .join("");
}

export function parseMetricValue(raw: string): ParsedMetric {
  const trimmed = normalizeDigits(raw.trim());
  const match = trimmed.match(/^([^\d]*?)([\d,]+(?:\.\d+)?)(.*)$/);

  if (!match) {
    return {
      prefix: "",
      number: 0,
      suffix: trimmed,
      decimals: 0,
      useCommas: false,
    };
  }

  const [, prefix, numStr, suffix] = match;
  const clean = numStr.replace(/,/g, "");
  const decimals = clean.includes(".") ? clean.split(".")[1]?.length ?? 0 : 0;

  return {
    prefix,
    number: Number.parseFloat(clean) || 0,
    suffix,
    decimals,
    useCommas: numStr.includes(","),
  };
}

export function formatMetricValue(parsed: ParsedMetric, value: number): string {
  const clamped = Math.min(value, parsed.number);

  let formatted: string;

  if (parsed.decimals > 0) {
    formatted = clamped.toFixed(parsed.decimals);
  } else if (parsed.useCommas) {
    formatted = Math.round(clamped).toLocaleString("en-US");
  } else {
    formatted = String(Math.round(clamped));
  }

  return `${parsed.prefix}${formatted}${parsed.suffix}`;
}
