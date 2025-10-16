import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[hsl(258,90%,76%)] via-[hsl(258,90%,66%)] to-[hsl(243,75%,59%)] bg-size-200 bg-pos-0 hover:bg-pos-100 text-white shadow-[0_4px_24px_rgba(167,139,250,0.35)] hover:shadow-[0_8px_32px_rgba(167,139,250,0.5)] hover:-translate-y-0.5 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        destructive: "rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "rounded-xl bg-white/80 backdrop-blur-md border border-primary/20 text-foreground hover:bg-white hover:border-primary/30 hover:shadow-lg",
        ghost: "rounded-lg text-foreground/60 hover:text-foreground hover:bg-white/50",
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
