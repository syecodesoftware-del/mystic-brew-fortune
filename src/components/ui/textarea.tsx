import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full px-5 py-4 rounded-xl bg-white/80 backdrop-blur-sm border border-primary/20 text-gray-900 placeholder:text-gray-500 font-sans text-base focus:outline-none focus:border-primary/50 focus:bg-white focus:text-gray-900 focus:shadow-[0_0_24px_rgba(167,139,250,0.2)] focus:ring-2 focus:ring-primary/20 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
