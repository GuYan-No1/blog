import { useEffect } from "react";

interface Props {
  type: "success" | "error";
  text: string;
  /** 自动关闭时长，单位毫秒，传 0 则不自动关闭 */
  duration?: number;
  onClose?: () => void;
}

export default function MessageBar({
  type,
  text,
  duration = 3000,
  onClose,
}: Props) {
  useEffect(() => {
    if (duration <= 0 || !onClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
        type === "success"
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-red-500/30 bg-red-500/10 text-red-400"
      }`}
    >
      {text}
    </div>
  );
}
