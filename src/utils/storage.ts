import { ScrapItem } from '../types';

const STORAGE_KEY = 'scrappedTexts';

/**
 * 스크랩 데이터 저장
 */
export const saveScraps = (scraps: ScrapItem[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scraps));
};

/**
 * 스크랩 데이터 로드
 */
export const loadScraps = (): ScrapItem[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load scraps:', e);
    return [];
  }
};