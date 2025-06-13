
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserFormProps {
  isCompatible: boolean;
  onBack: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  customerType: 'business' | 'residential';
  additionalNotes: string;
}

const UserForm = ({ isCompatible, onBack }: UserFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    customerType: 'residential',
    additionalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      console.log('Submitting form data:', {
        ...formData,
        requestType: isCompatible ? 'windows_11_upgrade' : 'new_device_quote',
        timestamp: new Date().toISOString()
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast({
        title: "Request submitted successfully!",
        description: "We'll contact you within 1-2 business days."
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto pt-16">
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Request Submitted Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for your interest. Our team will review your request and contact you within 1-2 business days.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Request Type: {isCompatible ? 'Windows 11 Upgrade' : 'New Device Quote'}</p>
                <p>Contact Email: {formData.email}</p>
                <p>Customer Type: {formData.customerType === 'business' ? 'Business' : 'Residential'}</p>
              </div>
              <Button 
                onClick={() => window.location.reload()}
                className="mt-8"
                size="lg"
              >
                Check Another Device
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Button 
          onClick={onBack}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {isCompatible ? 'Request Windows 11 Upgrade' : 'Request New Device Quote'}
            </CardTitle>
            <CardDescription>
              {isCompatible 
                ? 'Great! Your device is compatible. Let us help you upgrade to Windows 11.'
                : 'Your current device isn\'t compatible, but we can help you find the perfect new device.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              {/* Customer Type */}
              <div className="space-y-3">
                <Label>Customer Type *</Label>
                <RadioGroup 
                  value={formData.customerType} 
                  onValueChange={(value) => handleInputChange('customerType', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="residential" id="residential" />
                    <Label htmlFor="residential">Residential</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business">Business</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Information (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder={isCompatible 
                    ? "Any specific requirements or questions about the Windows 11 upgrade?"
                    : "Tell us about your computing needs, budget range, or any specific requirements for your new device."
                  }
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-pulse" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By submitting this form, you agree to be contacted regarding your {isCompatible ? 'upgrade' : 'device'} request.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserForm;
