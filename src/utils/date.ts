export function isFirstOrLastTuesday(date: Date = new Date()): boolean {
    const day = date.getDay();
    if (day !== 2) return false; // Not a Tuesday

    const dayOfMonth = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    // Check if it's the first Tuesday
    // It's the first Tuesday if the dayOfMonth is <= 7 (since 1st Tuesday must be within first 7 days)
    if (dayOfMonth <= 7) return true;

    // Check if it's the last Tuesday
    // Get the total days in the current month
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    // It's the last Tuesday if adding 7 days puts us into the next month
    if (dayOfMonth + 7 > lastDayOfMonth) return true;

    return false;
}
