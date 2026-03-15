import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Beautiful premium button
export const GlowButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }>(
  ({ className = '', variant = 'primary', children, ...props }, ref) => {
    
    const baseClass = "relative inline-flex items-center justify-center px-8 py-4 rounded-full font-medium transition-all duration-300 overflow-hidden";
    
    const variants = {
      primary: "bg-primary text-primary-foreground shadow-[0_8px_30px_rgb(232,154,154,0.3)] hover:shadow-[0_8px_40px_rgb(232,154,154,0.5)] hover:-translate-y-1",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:-translate-y-0.5",
      outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/5 hover:-translate-y-0.5"
    };

    return (
      <button 
        ref={ref} 
        className={`${baseClass} ${variants[variant]} ${props.disabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : ''} ${className}`}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        {variant === 'primary' && !props.disabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] z-0" />
        )}
      </button>
    );
  }
);
GlowButton.displayName = 'GlowButton';

// Beautiful Glass Card
export const GlassCard = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 lg:p-8 ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

// Badge
export const Badge = ({ children, severity = 'medium' }: { children: React.ReactNode, severity?: 'low'|'medium'|'high'|'default' }) => {
  const colors = {
    low: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    high: "bg-red-100 text-red-700 border-red-200",
    default: "bg-primary/10 text-primary border-primary/20"
  };
  
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${colors[severity]} inline-flex items-center shadow-sm`}>
      {children}
    </span>
  );
};
