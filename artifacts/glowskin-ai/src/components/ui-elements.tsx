import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Beautiful premium button
export const GlowButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }>(
  ({ className = '', variant = 'primary', children, ...props }, ref) => {
    const baseClass = "relative inline-flex items-center justify-center px-8 py-4 rounded-full font-medium transition-all duration-300 overflow-hidden";
    const variants = {
      primary: "bg-primary text-primary-foreground shadow-[0_8px_30px_rgba(180,80,110,0.35)] hover:shadow-[0_8px_40px_rgba(180,80,110,0.55)] hover:-translate-y-1",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:-translate-y-0.5",
      outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10 hover:-translate-y-0.5"
    };
    return (
      <button
        ref={ref}
        className={`${baseClass} ${variants[variant]} ${props.disabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : ''} ${className}`}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        {variant === 'primary' && !props.disabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] z-0" />
        )}
      </button>
    );
  }
);
GlowButton.displayName = 'GlowButton';

// Beautiful Glass Card — dark-mode aware
export const GlassCard = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          bg-card/80 backdrop-blur-xl border border-border
          shadow-[0_8px_30px_rgba(0,0,0,0.25)]
          dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)]
          rounded-3xl p-6 lg:p-8
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

// Badge
export const Badge = ({ children, severity = 'medium' }: { children: React.ReactNode, severity?: 'low' | 'medium' | 'high' | 'default' }) => {
  const colors = {
    low:     "bg-green-900/50  text-green-300  border-green-700/50",
    medium:  "bg-yellow-900/50 text-yellow-300 border-yellow-700/50",
    high:    "bg-red-900/50    text-red-300    border-red-700/50",
    default: "bg-primary/20   text-primary    border-primary/30",
  };
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full border inline-flex items-center shadow-sm ${colors[severity]}`}>
      {children}
    </span>
  );
};
