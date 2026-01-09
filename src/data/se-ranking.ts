export interface KeywordData {
    id: number;
    keyword: string;
    position: number;
    change: number; // positive = moved up (good), negative = moved down (bad)
    volume: number;
}

export const mockSeRankingData: KeywordData[] = [
    { id: 1, keyword: 'm51', position: 1, change: 0, volume: 210 },
    { id: 2, keyword: 'mediekjøp', position: 1, change: 0, volume: 10 },
    { id: 3, keyword: 'programmatisk mediekjøp', position: 2, change: 0, volume: 10 },
    { id: 4, keyword: 'reklamefilmproduksjon', position: 2, change: 3, volume: 260 },
    { id: 5, keyword: 'seo webinar', position: 4, change: 0, volume: 10 },
    { id: 6, keyword: 'digital analyse', position: 7, change: 0, volume: 10 },
    { id: 7, keyword: 'innholdsproduksjon', position: 12, change: -1, volume: 260 },
    { id: 8, keyword: 'performance byrå oslo', position: 21, change: 0, volume: 40 },
    { id: 9, keyword: 'annonsering i sosiale medier', position: 23, change: 0, volume: 20 },
    { id: 10, keyword: 'tiktok markedsføring', position: 31, change: -2, volume: 20 },
    { id: 11, keyword: 'studiobilder', position: 37, change: -1, volume: 110 },
    { id: 12, keyword: 'employer branding', position: 47, change: 0, volume: 590 },
];
