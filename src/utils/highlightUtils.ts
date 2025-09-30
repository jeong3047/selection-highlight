import { ScrapItem } from "../types";
import { findRangeByOffset } from "./textUtils";
import { CSS_CLASSES, HTML_TAGS } from "../constants";

/**
 * 모든 하이라이트 제거
 */
export const removeAllHighlights = (): void => {
  document
    .querySelectorAll(`.${CSS_CLASSES.HIGHLIGHT_SCRAP}`)
    .forEach((highlight) => {
      const parent = highlight.parentNode;
      if (parent) {
        while (highlight.firstChild) {
          parent.insertBefore(highlight.firstChild, highlight);
        }
        parent.removeChild(highlight);
      }
    });
  document
    .querySelectorAll(CSS_CLASSES.CONTENT_SELECTORS)
    .forEach((el) => el.normalize());
};

/**
 * 오프셋 기반으로 하이라이트 렌더링
 */
export const renderHighlightsFromOffsets = (scraps: ScrapItem[]): void => {
  const contentElement = document.querySelector(`.${CSS_CLASSES.CONTENT}`);
  if (!contentElement) return;

  const sortedScraps = [...scraps].sort(
    (a, b) => a.offset.start - b.offset.start
  );
  const ranges: Array<{ range: Range; scrapId: string }> = [];

  sortedScraps.forEach((item) => {
    const range = findRangeByOffset(
      contentElement,
      item.offset.start,
      item.offset.end
    );
    if (range) {
      ranges.push({ range, scrapId: item.id });
    }
  });

  ranges.reverse().forEach(({ range, scrapId }) => {
    try {
      const highlightSpan = document.createElement(HTML_TAGS.BOLD);
      highlightSpan.className = CSS_CLASSES.HIGHLIGHT_SCRAP;
      highlightSpan.dataset.scrapId = scrapId;
      range.surroundContents(highlightSpan);
    } catch (e) {
      try {
        const contents = range.extractContents();
        const highlightSpan = document.createElement(HTML_TAGS.BOLD);
        highlightSpan.className = CSS_CLASSES.HIGHLIGHT_SCRAP;
        highlightSpan.dataset.scrapId = scrapId;
        highlightSpan.appendChild(contents);
        range.insertNode(highlightSpan);
      } catch (err) {
        console.error("Failed to apply highlight:", err);
      }
    }
  });
};
