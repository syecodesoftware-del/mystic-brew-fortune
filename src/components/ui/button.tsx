import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "group relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent via-primary to-[hsl(243,75%,59%)] text-primary-foreground shadow-[0_4px_24px_rgba(109,71,220,0.25)] hover:shadow-[0_8px_32px_rgba(109,71,220,0.4)] hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        destructive: "rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]",
        ghost: "rounded-lg text-white/60 hover:text-white hover:bg-white/5",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-8 py-4 text-base",
        sm: "px-4 py-2 text-sm rounded-lg",
        lg: "px-8 py-4 text-base rounded-2xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {variant === "default" ? <span className="relative z-10">{children}</span> : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
