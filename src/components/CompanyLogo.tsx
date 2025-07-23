import { useState } from 'react';

interface CompanyLogoProps {
  symbol: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CompanyLogo = ({ symbol, logoUrl, size = 'md', className = '' }: CompanyLogoProps) => {
  const [imageError, setImageError] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6';
      case 'md':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  };

  const getFallbackTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'md':
        return 'text-xs';
      case 'lg':
        return 'text-sm';
      default:
        return 'text-xs';
    }
  };

  // If no logo URL or image failed to load, show fallback
  if (!logoUrl || imageError) {
    return (
      <div className={`${getSizeClasses()} bg-emerald-600 rounded-lg flex items-center justify-center ${className}`}>
        <span className={`text-white font-bold ${getFallbackTextSize()}`}>
          {symbol.slice(0, 2)}
        </span>
      </div>
    );
  }

  return (
    <div className={`${getSizeClasses()} rounded-lg overflow-hidden ${className}`}>
      <img
        src={logoUrl}
        alt={`${symbol} logo`}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default CompanyLogo;