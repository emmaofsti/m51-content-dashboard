import { Contribution } from '../data/contributions';

export function calculateStreak(contributions: Contribution[]): number {
    const publishedContributions = contributions.filter(c =>
        c.status === 'Published'
    );

    if (publishedContributions.length === 0) return 0;

    // Get unique months where user published
    const publishedMonths = new Set(
        publishedContributions.map(c => c.date.substring(0, 7)) // YYYY-MM
    );

    // Sort months descending
    const sortedMonths = Array.from(publishedMonths).sort().reverse();

    if (sortedMonths.length === 0) return 0;

    let streak = 1;
    let currentMonthDate = new Date(sortedMonths[0] + '-01');

    // Check previous months
    for (let i = 1; i < sortedMonths.length; i++) {
        const prevMonthDate = new Date(sortedMonths[i] + '-01');

        // Calculate difference in months
        const diffMonths = (currentMonthDate.getFullYear() - prevMonthDate.getFullYear()) * 12 + (currentMonthDate.getMonth() - prevMonthDate.getMonth());

        if (diffMonths === 1) {
            streak++;
            currentMonthDate = prevMonthDate;
        } else {
            break;
        }
    }
    return streak;
}

export function calculateYearlyContributions(contributions: Contribution[], year: number = new Date().getFullYear()): number {
    return contributions.filter(c =>
        (c.status === 'Published' || c.status === 'In Review') &&
        new Date(c.date).getFullYear() === year
    ).length;
}
