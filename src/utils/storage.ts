import { ScrapItem } from '../types';
import { STORAGE_KEYS } from '../constants';

/**
 * 문장 스크랩 데이터 저장
 */
export const saveScraps = (scraps: ScrapItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.SCRAPPED_TEXTS, JSON.stringify(scraps));
};

/**
 * 문장 스크랩 데이터 로드
 */
export const loadScraps = (): ScrapItem[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.SCRAPPED_TEXTS);
  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load sentence scraps:', e);
    return [];
  }
};