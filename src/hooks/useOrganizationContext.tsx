import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OrganizationContextType {
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (id: string | null) => void;
}

const OrganizationContext = createContext<OrganizationContextType>({
  selectedOrganizationId: null,
  setSelectedOrganizationId: () => {}
});

export const useOrganizationContext = () => useContext(OrganizationContext);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    // Load selected organization from localStorage on mount
    const storedOrgId = localStorage.getItem('selectedOrganizationId');
    if (storedOrgId) {
      setSelectedOrganizationId(storedOrgId);
    }
  }, []);

  const handleSetSelectedOrganizationId = (id: string | null) => {
    setSelectedOrganizationId(id);
    if (id) {
      localStorage.setItem('selectedOrganizationId', id);
    } else {
      localStorage.removeItem('selectedOrganizationId');
    }
  };

  return (
    <OrganizationContext.Provider 
      value={{ 
        selectedOrganizationId, 
        setSelectedOrganizationId: handleSetSelectedOrganizationId 
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};