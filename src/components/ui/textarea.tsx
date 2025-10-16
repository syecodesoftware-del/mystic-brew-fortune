import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full px-5 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder:text-white/30 font-sans text-base focus:outline-none focus:border-accent/50 focus:bg-white/8 focus:shadow-[0_0_24px_rgba(109,71,220,0.15)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
