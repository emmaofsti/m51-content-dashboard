"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Contribution } from '../data/contributions';

interface ContributionsContextType {
    contributions: Contribution[];
    addContribution: (contribution: Omit<Contribution, 'id'>) => Promise<void>;
    deleteContribution: (id: string) => Promise<void>;
    refreshContributions: () => Promise<void>;
    isLoading: boolean;
}

const ContributionsContext = createContext<ContributionsContextType | undefined>(undefined);

export function ContributionsProvider({ children }: { children: ReactNode }) {
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchContributions = async () => {
        try {
            const res = await fetch('/api/contributions', { cache: 'no-store' });
            const data = await res.json();
            if (Array.isArray(data)) {
                setContributions(data);
            }
        } catch (err) {
            console.error("Failed to fetch contributions", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Load from API on mount
    useEffect(() => {
        fetchContributions();
    }, []);

    const refreshContributions = async () => {
        await fetchContributions();
    };

    const addContribution = async (newContribution: Omit<Contribution, 'id'>) => {
        // Optimistic update
        const tempId = Math.random().toString(36).substr(2, 9);
        const optimisticContribution = { ...newContribution, id: tempId };

        setContributions(prev => [optimisticContribution, ...prev]);

        try {
            const res = await fetch('/api/contributions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(optimisticContribution),
            });

            if (!res.ok) {
                throw new Error('Failed to save');
            }

            // Optionally reload to get real ID, but for now this is fine
            // or update the ID if the server returns the object
            const savedItem = await res.json();
            setContributions(prev => prev.map(c => c.id === tempId ? savedItem : c));

        } catch (error) {
            console.error("Failed to add contribution", error);
            // Rollback
            setContributions(prev => prev.filter(c => c.id !== tempId));
        }
    };

    const deleteContribution = async (id: string) => {
        // Optimistic update
        const previousContributions = contributions;
        setContributions(prev => prev.filter(c => c.id !== id));

        try {
            const res = await fetch('/api/contributions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error("Failed to delete contribution", error);
            // Rollback
            setContributions(previousContributions);
            alert('Kunne ikke slette bidraget. Prøv igjen.');
        }
    };

    return (
        <ContributionsContext.Provider value={{ contributions, addContribution, deleteContribution, refreshContributions, isLoading }}>
            {children}
        </ContributionsContext.Provider>
    );
}

export function useContributions() {
    const context = useContext(ContributionsContext);
    if (context === undefined) {
        throw new Error('useContributions must be used within a ContributionsProvider');
    }
    return context;
}
