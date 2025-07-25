import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SandboxBanner = () => {
  return (
    <Alert className="bg-warning/10 border-warning text-warning-foreground">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="font-semibold">
        🧪 SANDBOX MODE: TEST ONLY - No real trades or money involved
      </AlertDescription>
    </Alert>
  );
};

export default SandboxBanner;