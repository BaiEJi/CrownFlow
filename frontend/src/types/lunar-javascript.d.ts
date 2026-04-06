declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
  }

  export class Lunar {
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearShengXiao(): string;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getJieQi(): string;
    getFestivals(): string[];
    getOtherFestivals(): string[];
    getDayInGanZhi(): string;
    getMonthInGanZhi(): string;
    getYearInGanZhi(): string;
  }
}
