import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, ArrowLeft, Bug, Sparkles, HelpCircle, Image, Video, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackFormData {
  name: string;
  email: string;
  summary: string;
  description: string;
}

const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const [currentStep, setCurrentStep] = useState<'selection' | 'form'>('selection');
  const [selectedType, setSelectedType] = useState<'technical' | 'suggestion' | 'help'>('technical');
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    email: '',
    summary: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setCurrentStep('selection');
    setFormData({ name: '', email: '', summary: '', description: '' });
    onClose();
  };

  const handleTypeSelect = (type: 'technical' | 'suggestion' | 'help') => {
    setSelectedType(type);
    setCurrentStep('form');
  };

  const handleBack = () => {
    setCurrentStep('selection');
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.summary || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-feedback', {
        body: {
          type: selectedType,
          ...formData
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Feedback sent!",
        description: "Thank you for your feedback. We'll get back to you soon.",
      });
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormTitle = () => {
    switch (selectedType) {
      case 'technical':
        return 'Flag a Technical Issue';
      case 'suggestion':
        return 'Share a Suggestion';
      case 'help':
        return 'Get Help';
      default:
        return 'Feedback';
    }
  };

  const getFormDescription = () => {
    switch (selectedType) {
      case 'technical':
        return 'Tell us what\'s broken';
      case 'suggestion':
        return 'Share your ideas with us';
      case 'help':
        return 'We\'re here to help';
      default:
        return '';
    }
  };

  const getPlaceholderText = () => {
    switch (selectedType) {
      case 'technical':
        return 'Summary of the issue you\'re experiencing';
      case 'suggestion':
        return 'Brief summary of your suggestion';
      case 'help':
        return 'What do you need help with?';
      default:
        return 'Summary';
    }
  };

  if (currentStep === 'selection') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="relative">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <span className="text-blue-500 font-bold text-sm">?</span>
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-semibold">
              What would you like to share?
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <Button
              variant="ghost"
              className="w-full justify-start p-4 h-auto"
              onClick={() => handleTypeSelect('technical')}
            >
              <div className="flex items-center space-x-3">
                <Bug className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">Flag a Technical Issue</div>
                  <div className="text-sm text-muted-foreground">Let us know if something is broken</div>
                </div>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start p-4 h-auto"
              onClick={() => handleTypeSelect('suggestion')}
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">Share a Suggestion</div>
                  <div className="text-sm text-muted-foreground">Ideas on how we could improve</div>
                </div>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start p-4 h-auto"
              onClick={() => handleTypeSelect('help')}
            >
              <div className="flex items-center space-x-3">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium">Get Help</div>
                  <div className="text-sm text-muted-foreground">Contact our support team</div>
                </div>
              </div>
            </Button>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            Powered by <span className="font-semibold">Userback</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="relative bg-blue-500 text-white p-4 -m-6 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2 text-white hover:bg-blue-600"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-center text-lg font-semibold">
            {getFormTitle()}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-white hover:bg-blue-600"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center text-lg font-medium mb-6">
            {getFormDescription()}
          </div>
          
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            
            <Input
              placeholder={getPlaceholderText()}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            />
            
            <Textarea
              placeholder="Describe the issue in detail, including steps to reproduce and the expected behavior"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Powered by <span className="font-semibold">Userback</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;