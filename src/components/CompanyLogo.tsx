import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CompanyLogoProps {
  symbol: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CompanyLogo = ({ symbol, logoUrl: propLogoUrl, size = 'md', className = '' }: CompanyLogoProps) => {
  const [imageError, setImageError] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(propLogoUrl || null);
  const [loading, setLoading] = useState(!propLogoUrl);

  useEffect(() => {
    if (!propLogoUrl && symbol) {
      fetchLogoFromDB();
    }
  }, [symbol, propLogoUrl]);

  const fetchLogoFromDB = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_logos')
        .select('logo_url')
        .eq('symbol', symbol.toUpperCase())
        .single();

      if (error) {
        console.error('Error fetching logo:', error);
        setLogoUrl(null);
      } else {
        setLogoUrl(data?.logo_url || null);
      }
    } catch (err) {
      console.error('Error fetching logo:', err);
      setLogoUrl(null);
    } finally {
      setLoading(false);
    }
  };

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

  // Show loading state briefly
  if (loading) {
    return (
      <div className={`${getSizeClasses()} bg-slate-600 rounded-lg flex items-center justify-center animate-pulse ${className}`}>
        <div className="w-4 h-4 bg-slate-500 rounded"></div>
      </div>
    );
  }

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