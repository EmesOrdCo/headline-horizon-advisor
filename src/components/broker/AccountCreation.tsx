import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAlpacaBroker, CreateAccountData } from '@/hooks/useAlpacaBroker';
import { toast } from 'sonner';

interface AccountCreationProps {
  onAccountCreated: () => void;
}

const AccountCreation = ({ onAccountCreated }: AccountCreationProps) => {
  // Generate unique test data to avoid conflicts
  const generateUniqueEmail = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `test_user_${timestamp}_${randomNum}@example.com`;
  };

  const generateUniquePhone = () => {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `+1555${randomNum}`;
  };

  const [formData, setFormData] = useState({
    email: generateUniqueEmail(),
    phone: generateUniquePhone(),
    street1: '20 N San Mateo Dr',
    street2: '',
    city: 'San Mateo',
    state: 'CA',
    postal_code: '94401',
    given_name: 'Test',
    family_name: 'User',
    date_of_birth: '1990-01-01',
    tax_id: '123456789',
    funding_source: 'employment_income',
  });

  const { createAccount, loading } = useAlpacaBroker();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const accountData: CreateAccountData = {
      contact: {
        email_address: formData.email,
        phone_number: formData.phone,
        street_address: [formData.street1, formData.street2].filter(Boolean),
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: 'USA',
      },
      identity: {
        given_name: formData.given_name,
        family_name: formData.family_name,
        date_of_birth: formData.date_of_birth,
        tax_id: formData.tax_id,
        tax_id_type: 'USA_SSN',
        country_of_citizenship: 'USA',
        country_of_birth: 'USA',
        country_of_tax_residence: 'USA',
        funding_source: [formData.funding_source],
      },
      disclosures: {
        is_control_person: false,
        is_affiliated_exchange_or_finra: false,
        is_politically_exposed: false,
        immediate_family_exposed: false,
      },
      agreements: [
        {
          agreement: 'customer_agreement',
          signed_at: new Date().toISOString(),
          ip_address: '192.168.1.1',
        },
      ],
    };

    try {
      await createAccount(accountData);
      toast.success('Account created successfully!');
      onAccountCreated();
    } catch (error) {
      console.error('Account creation error:', error);
      
      // Parse error message for specific error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('Error message received:', errorMessage);
      
      // Show specific error message from the API
      toast.error(errorMessage || 'Account creation failed. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Test Account</CardTitle>
        <CardDescription>
          Create a new sandbox account with auto-generated unique test data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="given_name">First Name</Label>
              <Input
                id="given_name"
                value={formData.given_name}
                onChange={(e) => setFormData({ ...formData, given_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="family_name">Last Name</Label>
              <Input
                id="family_name"
                value={formData.family_name}
                onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="tax_id">SSN (Test)</Label>
            <Input
              id="tax_id"
              value={formData.tax_id}
              onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              required
              placeholder="123456789"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street1">Street Address</Label>
              <Input
                id="street1"
                value={formData.street1}
                onChange={(e) => setFormData({ ...formData, street1: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">State</Label>
              <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="postal_code">ZIP Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="funding_source">Funding Source</Label>
            <Select value={formData.funding_source} onValueChange={(value) => setFormData({ ...formData, funding_source: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employment_income">Employment Income</SelectItem>
                <SelectItem value="investments">Investments</SelectItem>
                <SelectItem value="inheritance">Inheritance</SelectItem>
                <SelectItem value="business_income">Business Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="agreements" required />
            <Label htmlFor="agreements" className="text-sm">
              I agree to the terms and conditions (test environment)
            </Label>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Test Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountCreation;