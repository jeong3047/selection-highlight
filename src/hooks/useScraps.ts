import { useState, useEffect } from "react";
import { ScrapItem } from "../types";
import { loadScraps, saveScraps } from "../utils/storage";
import {
  removeAllHighlights,
  renderHighlightsFromOffsets,
} from "../utils/highlightUtils";
import { saveHighlightedContent } from "../utils/scrapUtils";
import { CSS_CLASSES } from "../constants";

export const useScraps = () => {
  const [scrappedTexts, setScrappedTexts] = useState<ScrapItem[]>([]);

  // localStorage에서 문장 스크랩 데이터 로드
  useEffect(() => {
    const loaded = loadScraps();
    setScrappedTexts(loaded);
  }, []);

  // 문장 스크랩 하이라이트 복원
  useEffect(() => {
    removeAllHighlights();
    renderHighlightsFromOffsets(scrappedTexts);

    // 하이라이트가 렌더링된 후 변경된 콘텐츠를 localStorage에 저장
    setTimeout(() => {
      const contentElement = document.querySelector(`.${CSS_CLASSES.CONTENT}`);
      if (contentElement && contentElement.innerHTML) {
        saveHighlightedContent(contentElement.innerHTML);
      }
    }, 100);
  }, [scrappedTexts]);

  const addScrap = (scrap: ScrapItem) => {
    const newScraps = [...scrappedTexts, scrap];
    setScrappedTexts(newScraps);
    saveScraps(newScraps);
  };

  const deleteScrap = (id: string) => {
    const newScraps = scrappedTexts.filter((item) => item.id !== id);
    setScrappedTexts(newScraps);
    saveScraps(newScraps);
  };

  const clearAllScraps = () => {
    setScrappedTexts([]);
    saveScraps([]);
  };

  const isDuplicate = (startOffset: number, endOffset: number): boolean => {
    return scrappedTexts.some(
      (item) =>
        item.offset.start === startOffset && item.offset.end === endOffset
    );
  };

  return {
    scrappedTexts,
    addScrap,
    deleteScrap,
    clearAllScraps,
    isDuplicate,
  };
};
