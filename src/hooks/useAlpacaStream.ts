
// DEPRECATED: Use useAlpacaStreamSingleton instead to prevent connection limit issues
import { useAlpacaStreamSingleton } from './useAlpacaStreamSingleton';

interface UseAlpacaStreamProps {
  symbols: string[];
  enabled?: boolean;
}

// This hook is deprecated and redirects to the singleton version
// to prevent multiple WebSocket connections which cause "connection limit exceeded" errors
export const useAlpacaStream = ({ symbols, enabled = true }: UseAlpacaStreamProps) => {
  console.warn('useAlpacaStream is deprecated. Use useAlpacaStreamSingleton to prevent connection limit issues.');
  return useAlpacaStreamSingleton({ symbols, enabled });
};
