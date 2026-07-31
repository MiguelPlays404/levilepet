import { RectangleVertical, Square, RectangleHorizontal } from "lucide-react";

export type AspectRatio = "16:9" | "4:3" | "1:1" | "3:4" | "9:16";

export const ASPECT_OPTIONS: { value: AspectRatio; label: string; iconLabel: string }[] = [
  { value: "16:9", label: "16:9", iconLabel: "Horizontal" },
  { value: "4:3",  label: "4:3",  iconLabel: "Paisagem" },
  { value: "1:1",  label: "1:1",  iconLabel: "Quadrada" },
  { value: "3:4",  label: "3:4",  iconLabel: "Retrato" },
  { value: "9:16", label: "9:16", iconLabel: "Vertical" },
];

/** Tailwind aspect class for a given aspect ratio */
export function aspectClass(ar?: string | null): string {
  switch (ar) {
    case "16:9": return "aspect-video";
    case "4:3":  return "aspect-[4/3]";
    case "1:1":  return "aspect-square";
    case "3:4":  return "aspect-[3/4]";
    case "9:16": return "aspect-[9/16]";
    default:     return "aspect-video";
  }
}

export function aspectStyle(ar?: string | null): React.CSSProperties {
  const map: Record<string, string> = {
    "16:9": "16/9", "4:3": "4/3", "1:1": "1/1", "3:4": "3/4", "9:16": "9/16",
  };
  return { aspectRatio: map[ar || "16:9"] || "16/9" };
}

/** Convert legacy orientation → aspect ratio default */
export function orientationToAspect(orientation?: string | null, fallback: AspectRatio = "16:9"): AspectRatio {
  if (orientation === "vertical") return "9:16";
  if (orientation === "horizontal") return "16:9";
  return fallback;
}

export function aspectToOrientation(ar?: string | null): "vertical" | "horizontal" {
  if (ar === "9:16" || ar === "3:4") return "vertical";
  return "horizontal";
}

const IconBox = ({ ratio, active }: { ratio: AspectRatio; active: boolean }) => {
  const cls = active ? "text-primary" : "text-[#A1A1AA]";
  const map: Record<AspectRatio, JSX.Element> = {
    "16:9": <RectangleHorizontal className={`w-5 h-5 ${cls}`} />,
    "4:3":  <RectangleHorizontal className={`w-5 h-5 ${cls}`} style={{ transform: "scaleX(0.9)" }} />,
    "1:1":  <Square className={`w-5 h-5 ${cls}`} />,
    "3:4":  <RectangleVertical className={`w-5 h-5 ${cls}`} style={{ transform: "scaleY(0.9)" }} />,
    "9:16": <RectangleVertical className={`w-5 h-5 ${cls}`} />,
  };
  return map[ratio];
};

interface Props {
  value: string;
  onChange: (v: AspectRatio) => void;
  required?: boolean;
  label?: string;
  compact?: boolean;
}

export function AspectRatioPicker({ value, onChange, required, label = "Proporção da mídia", compact }: Props) {
  return (
    <div>
      <label className="block text-xs text-[#A1A1AA] mb-2 font-heading">
        {label} {required && <span className="text-red-400">*obrigatório</span>}
      </label>
      <div className={`grid grid-cols-5 gap-2 ${compact ? "text-[10px]" : "text-xs"}`}>
        {ASPECT_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 font-heading font-semibold transition-all ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[#3F3F46] text-[#A1A1AA] hover:border-[#52525B]"
              }`}
              title={opt.iconLabel}
            >
              <IconBox ratio={opt.value} active={active} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
      {required && !value && (
        <p className="text-[11px] text-red-400 mt-1.5 font-heading">
          Selecione a proporção para continuar
        </p>
      )}
    </div>
  );
}
