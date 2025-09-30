import { useState, useEffect, useRef, useCallback } from 'react';
import { TooltipState, CurrentSelection } from '../types';
import { isInAllowedElement } from '../utils/textUtils';

export const useTextSelection = () => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    isScraped: false,
  });
  const [currentSelection, setCurrentSelection] = useState<CurrentSelection | null>(null);
  const isHighlightClickRef = useRef(false);

  const hideTooltip = useCallback(() => {
    setTooltip({ show: false, x: 0, y: 0, isScraped: false });
    setCurrentSelection(null);
  }, []);

  const showTooltipAt = useCallback((rect: DOMRect, isScraped: boolean, text: string, scrapId: string | null) => {
    setCurrentSelection({
      text,
      isAlreadyScraped: isScraped,
      scrapId,
    });

    setTooltip({
      show: true,
      x: rect.left + rect.width / 2 - 40,
      y: rect.top - 45 < 0 ? rect.bottom + 10 : rect.top - 45,
      isScraped,
    });
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => {
        if (isHighlightClickRef.current) {
          isHighlightClickRef.current = false;
          return;
        }

        const selection = window.getSelection();
        if (!selection) return;

        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
          if (!isInAllowedElement(selection.getRangeAt(0).startContainer)) {
            hideTooltip();
            return;
          }

          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          showTooltipAt(rect, false, selectedText, null);
        } else {
          hideTooltip();
        }
      }, 10);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const highlightElement = target.classList?.contains('highlight-scrap')
        ? target
        : target.closest('.highlight-scrap') as HTMLElement;

      if (highlightElement) {
        isHighlightClickRef.current = true;
        e.preventDefault();
        e.stopPropagation();

        const scrapId = highlightElement.dataset.scrapId || null;
        const rect = highlightElement.getBoundingClientRect();

        showTooltipAt(rect, true, highlightElement.textContent || '', scrapId);

        return false;
      }
    };

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isHighlight = target.classList?.contains('highlight-scrap') || target.closest('.highlight-scrap');
      const isTooltip = target.closest('.tooltip');

      if (!isTooltip && !isHighlight) {
        hideTooltip();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClick as EventListener, true);
    document.addEventListener('click', handleDocumentClick as EventListener, false);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClick as EventListener, true);
      document.removeEventListener('click', handleDocumentClick as EventListener, false);
    };
  }, [hideTooltip, showTooltipAt]);

  return {
    tooltip,
    currentSelection,
    hideTooltip,
  };
};