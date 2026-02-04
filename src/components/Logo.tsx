import { Leaf } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-xl' },
    lg: { icon: 36, text: 'text-2xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="gradient-primary p-2 rounded-xl">
        <Leaf className="text-primary-foreground" size={icon} />
      </div>
      <div className="flex flex-col">
        <span className={`${text} font-serif font-bold text-foreground leading-tight`}>
          Equilibrium Vida
        </span>
        <span className="text-xs font-medium text-primary tracking-wider uppercase">
          Vida & Saúde
        </span>
      </div>
    </div>
  );
}
