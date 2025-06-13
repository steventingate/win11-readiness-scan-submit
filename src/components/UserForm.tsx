
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, Send, Computer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SystemInfo } from '@/pages/Index';

interface UserFormProps {
  isCompatible: boolean;
  systemInfo: SystemInfo;
  onBack: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  customerType: 'business' | 'residential';
  additionalNotes: string;
}

const UserForm = ({ isCompatible, systemInfo, onBack }: UserFormProps) => {
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
      // Prepare submission data with system information
      const submissionData = {
        ...formData,
        systemInfo,
        requestType: isCompatible ? 'windows_11_upgrade' : 'hardware_upgrade_quote',
        timestamp: new Date().toISOString(),
        source: 'Helpdesk Computers - Windows 11 Compatibility Checker'
      };

      console.log('Submitting enhanced form data:', submissionData);

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast({
        title: "Request submitted successfully!",
        description: "Our technical team will contact you within 1-2 business days."
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly at helpdeskcomputers.com.au",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
        {/* Header */}
        <div className="bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <Computer className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Helpdesk Computers</h1>
                <p className="text-sm text-gray-600">Professional IT Solutions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto pt-16 px-4">
          <Card className="text-center bg-white/95 backdrop-blur-sm">
            <CardContent className="pt-12 pb-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4 text-blue-800">Request Submitted Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for choosing Helpdesk Computers. Our technical team will review your system information and contact you within 1-2 business days with a comprehensive solution.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-semibold text-blue-800 mb-3">Submission Summary:</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-medium">Service Type:</span> {isCompatible ? 'Windows 11 Upgrade Service' : 'Hardware Upgrade Consultation'}</p>
                  <p><span className="font-medium">Device:</span> {systemInfo.manufacturer} {systemInfo.model}</p>
                  <p><span className="font-medium">Serial Number:</span> {systemInfo.serialNumber}</p>
                  <p><span className="font-medium">Contact Email:</span> {formData.email}</p>
                  <p><span className="font-medium">Customer Type:</span> {formData.customerType === 'business' ? 'Business' : 'Residential'}</p>
                  <p><span className="font-medium">Warranty Status:</span> {systemInfo.warrantyStatus}</p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-blue-600 font-medium">Visit us at helpdeskcomputers.com.au</p>
                <p className="text-xs text-gray-500">For immediate assistance, please call our support team</p>
              </div>

              <Button 
                onClick={() => window.location.reload()}
                className="mt-8 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Analyze Another Device
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Computer className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Helpdesk Computers</h1>
              <p className="text-sm text-gray-600">Professional IT Solutions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-8 px-4">
        <Button 
          onClick={onBack}
          variant="ghost"
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>

        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-800">
              {isCompatible ? 'Windows 11 Upgrade Service Request' : 'Hardware Upgrade Consultation Request'}
            </CardTitle>
            <CardDescription>
              {isCompatible 
                ? 'Let our certified technicians handle your Windows 11 upgrade professionally.'
                : 'Our IT specialists will provide you with the best hardware upgrade options for Windows 11 compatibility.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Device Summary */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Device Information:</h3>
              <div className="text-sm space-y-1 text-gray-700">
                <p><span className="font-medium">Device:</span> {systemInfo.manufacturer} {systemInfo.model}</p>
                <p><span className="font-medium">Serial:</span> {systemInfo.serialNumber}</p>
                <p><span className="font-medium">Warranty:</span> {systemInfo.warrantyStatus}</p>
              </div>
            </div>

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
                    <Label htmlFor="residential">Residential Customer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business">Business Customer</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Requirements (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder={isCompatible 
                    ? "Any specific requirements for the Windows 11 upgrade? (e.g., preferred scheduling, data backup needs, software compatibility concerns)"
                    : "Tell us about your usage requirements, budget considerations, or specific software needs for your new Windows 11 compatible system."
                  }
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
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
                    Submit Service Request
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By submitting this form, you agree to be contacted by Helpdesk Computers regarding your {isCompatible ? 'upgrade service' : 'hardware consultation'} request.
                Visit <span className="font-medium">helpdeskcomputers.com.au</span> for more information.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserForm;
