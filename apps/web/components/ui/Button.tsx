import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600 disabled:bg-emerald-400",
  secondary:
    "bg-stone-100 text-stone-900 hover:bg-stone-200 focus-visible:ring-stone-400 border border-stone-300",
  ghost:
    "bg-transparent text-stone-700 hover:bg-stone-100 focus-visible:ring-stone-400",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant]} ${className}`}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
