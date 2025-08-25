import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrganizationSelector } from '@/components/organizations/OrganizationSelector';
import { Building, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const OrganizationSelection = () => {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleContinue = () => {
    if (selectedOrgId) {
      // Store selected organization in localStorage for persistence
      localStorage.setItem('selectedOrganizationId', selectedOrgId);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Select Organization</CardTitle>
          <p className="text-muted-foreground">
            Choose an organization to manage or create a new one
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <OrganizationSelector 
            selectedOrgId={selectedOrgId}
            onOrganizationChange={setSelectedOrgId}
          />
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={signOut}
              className="flex-1"
            >
              Sign Out
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!selectedOrgId}
              className="flex-1"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSelection;