export interface ScrapItem {
  id: string;
  offset: {
    start: number;
    end: number;
  };
  content: string;
  timestamp: string;
  url: string;
}

export interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  isScraped: boolean;
}

export interface CurrentSelection {
  text: string;
  isAlreadyScraped: boolean;
  scrapId: string | null;
}