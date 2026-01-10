"use client";

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useContributions } from '../../context/ContributionsContext';
import { employees } from '../../data/employees';
import { Contribution } from '../../data/contributions';
import { EmployeeCard } from '../../components/EmployeeCard';
import { Modal } from '../../components/Modal';
import { ContributionForm } from '../../components/ContributionForm';
import { ContributionList } from '../../components/ContributionList';
import { TeamProgress } from '../../components/TeamProgress';
import styles from './page.module.css';

import { Suspense } from 'react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const selectedMonth = searchParams.get('month') || '2026-01';

  const { contributions, addContribution } = useContributions();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Derive employee stats from contributions based on selected month
  const employeesWithStats = useMemo(() => {
    const currentYear = selectedMonth.split('-')[0];

    return employees.map(emp => {
      const empAllContributions = contributions.filter(c => c.employeeId === emp.id);

      // Filter for selected month stats
      const monthContributions = empAllContributions.filter(c => c.date.startsWith(selectedMonth));

      const deliveredCount = monthContributions.filter(c =>
        c.status === 'Published' || c.status === 'In Review'
      ).length;

      // Calculate Yearly Published Count
      const publishedCount = empAllContributions.filter(c =>
        c.date.startsWith(currentYear) && c.status === 'Published'
      ).length;

      // Calculate Streak (Global streak, not filtered by month)
      const publishedContributions = empAllContributions.filter(c => c.status === 'Published');
      let streak = 0;
      if (publishedContributions.length > 0) {
        const publishedMonths = new Set(
          publishedContributions.map(c => c.date.substring(0, 7))
        );
        const sortedMonths = Array.from(publishedMonths).sort().reverse();

        if (sortedMonths.length > 0) {
          streak = 1;
          let currentMonthDate = new Date(sortedMonths[0] + '-01');
          for (let i = 1; i < sortedMonths.length; i++) {
            const prevMonthDate = new Date(sortedMonths[i] + '-01');
            const diffMonths = (currentMonthDate.getFullYear() - prevMonthDate.getFullYear()) * 12 + (currentMonthDate.getMonth() - prevMonthDate.getMonth());
            if (diffMonths === 1) {
              streak++;
              currentMonthDate = prevMonthDate;
            } else {
              break;
            }
          }
        }
      }

      return {
        ...emp,
        stats: {
          ...emp.stats,
          delivered: deliveredCount,
          published: publishedCount,
          streak: streak
        }
      };
    }).sort((a, b) => b.stats.published - a.stats.published);
  }, [contributions, selectedMonth]);

  const selectedEmployee = useMemo(() =>
    employeesWithStats.find(e => e.id === selectedEmployeeId) || null
    , [selectedEmployeeId, employeesWithStats]);

  const selectedEmployeeContributions = useMemo(() =>
    contributions.filter(c => c.employeeId === selectedEmployeeId)
    , [contributions, selectedEmployeeId]);

  const handleAddContribution = (newContribution: Omit<Contribution, 'id'>) => {
    addContribution(newContribution);

    // Check if published and trigger notification
    if (newContribution.status === 'Published') {
      fetch('/api/notify-publication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newContribution.title })
      })
        .catch(err => console.error('Failed to send notification:', err));
    }

    setShowAddForm(false);
  };

  const closeModal = () => {
    setSelectedEmployeeId(null);
    setShowAddForm(false);
  };

  return (
    <>
      <h1 className={styles.title}>Nettsideinnhold – Oversikt</h1>
      <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '3rem' }} />
      <TeamProgress currentMonth={selectedMonth} />

      <div className={styles.grid}>
        {employeesWithStats.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onClick={() => setSelectedEmployeeId(employee.id)}
          />
        ))}
      </div>

      <Modal isOpen={!!selectedEmployee} onClose={closeModal}>
        {selectedEmployee && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>{selectedEmployee.name}</h2>
            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>{selectedEmployee.role}</p>

            <div style={{ textAlign: 'left', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{showAddForm ? 'Registrer nytt bidrag' : 'Bidrag denne måneden'}</h3>
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                      background: '#ff3b3f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    + Registrer bidrag
                  </button>
                )}
              </div>

              {showAddForm ? (
                <ContributionForm
                  employeeId={selectedEmployee.id}
                  onSave={handleAddContribution}
                  onCancel={() => setShowAddForm(false)}
                />
              ) : (
                <ContributionList contributions={selectedEmployeeContributions} />
              )}
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.9rem', color: '#999' }}>
              ID: {selectedEmployee.id} • {selectedEmployee.email}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default function Home() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<div>Laster...</div>}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
