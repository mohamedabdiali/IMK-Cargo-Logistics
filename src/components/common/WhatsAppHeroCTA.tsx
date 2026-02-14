import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppChatUrl, COMPANY_CONTACT } from "@/constants/operations";
import { cn } from "@/lib/utils";

interface WhatsAppHeroCTAProps {
  contextLabel: string;
  className?: string;
  theme?: "dark" | "light";
}

export function WhatsAppHeroCTA({
  contextLabel,
  className,
  theme = "dark",
}: WhatsAppHeroCTAProps) {
  const isDark = theme === "dark";

  return (
    <div className={cn("inline-flex flex-col items-start gap-2", className)}>
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold",
          isDark
            ? "bg-emerald-500/20 text-emerald-100 border border-emerald-300/25"
            : "bg-emerald-100 text-emerald-800 border border-emerald-300"
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Need quick help? Chat with operations now.
      </div>

      <a
        href={buildWhatsAppChatUrl(contextLabel)}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open WhatsApp chat ${COMPANY_CONTACT.phoneLine}`}
      >
        <Button
          type="button"
          className="h-11 rounded-full bg-emerald-600 px-6 text-white hover:bg-emerald-700"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          WhatsApp {COMPANY_CONTACT.phoneLine}
        </Button>
      </a>
    </div>
  );
}

