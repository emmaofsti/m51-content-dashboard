import styles from './EmployeeCard.module.css';
import { Employee } from '../data/employees';
import { CircularProgress } from './CircularProgress';

interface EmployeeCardProps {
    employee: Employee;
    onClick: () => void;
}

export function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
    const { delivered, target, streak, published } = employee.stats;

    return (
        <div className={styles.card} onClick={onClick}>
            <h3 className={styles.name}>{employee.name}</h3>

            <div className={styles.metrics}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <CircularProgress value={delivered} max={target} size={110} strokeWidth={8} />
                </div>

                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <span>Streak</span>
                        <span className={styles.statValue}>🔥 {streak} mnd</span>
                    </div>
                    <div className={styles.statItem}>
                        <span>Publisert</span>
                        <span className={styles.statValue}>🚀 {published}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
