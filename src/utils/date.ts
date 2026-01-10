export function isFirstTuesdayOfMonth(date: Date = new Date()): boolean {
    const day = date.getDay();
    const dayOfMonth = date.getDate();
    return day === 2 && dayOfMonth <= 7;
}

export function isLastTuesdayOfMonth(date: Date = new Date()): boolean {
    const day = date.getDay();
    if (day !== 2) return false;

    const dayOfMonth = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    return dayOfMonth + 7 > lastDayOfMonth;
}
