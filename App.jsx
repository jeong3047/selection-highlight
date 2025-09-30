import { useState, useEffect, useRef } from 'react';
import './style.css';

function App() {
  const [scrappedTexts, setScrappedTexts] = useState([]);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, isScraped: false });
  const [currentSelection, setCurrentSelection] = useState(null);
  const isHighlightClickRef = useRef(false);

  // localStorage에서 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem('scrappedTexts');
    if (saved) {
      const parsed = JSON.parse(saved);
      setScrappedTexts(parsed);
    }
  }, []);

  // 하이라이트 복원
  useEffect(() => {
    removeAllHighlights();
    renderHighlightsFromOffsets();
  }, [scrappedTexts]);

  // 이벤트 리스너 설정
  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => {
        if (isHighlightClickRef.current) {
          isHighlightClickRef.current = false;
          return;
        }

        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
          if (!isInAllowedElement(selection.getRangeAt(0).startContainer)) {
            hideTooltip();
            return;
          }

          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          setCurrentSelection({
            text: selectedText,
            isAlreadyScraped: false,
            scrapId: null,
          });

          setTooltip({
            show: true,
            x: rect.left + rect.width / 2 - 40,
            y: rect.top - 45 < 0 ? rect.bottom + 10 : rect.top - 45,
            isScraped: false,
          });
        } else {
          hideTooltip();
        }
      }, 10);
    };

    const handleClick = (e) => {
      const highlightElement = e.target.classList?.contains('highlight-scrap')
        ? e.target
        : e.target.closest('.highlight-scrap');

      if (highlightElement) {
        isHighlightClickRef.current = true;
        e.preventDefault();
        e.stopPropagation();

        const scrapId = highlightElement.dataset.scrapId;
        const rect = highlightElement.getBoundingClientRect();

        setCurrentSelection({
          text: highlightElement.textContent,
          isAlreadyScraped: true,
          scrapId: scrapId,
        });

        setTooltip({
          show: true,
          x: rect.left + rect.width / 2 - 40,
          y: rect.top - 45 < 0 ? rect.bottom + 10 : rect.top - 45,
          isScraped: true,
        });

        return false;
      }
    };

    const handleDocumentClick = (e) => {
      const isHighlight = e.target.classList?.contains('highlight-scrap') || e.target.closest('.highlight-scrap');
      const isTooltip = e.target.closest('.tooltip');

      if (!isTooltip && !isHighlight) {
        hideTooltip();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('click', handleDocumentClick, false);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('click', handleDocumentClick, false);
    };
  }, []);

  const isInAllowedElement = (startContainer) => {
    let currentElement = startContainer.nodeType === 3 ? startContainer.parentElement : startContainer;
    while (currentElement && currentElement !== document.body) {
      if (currentElement.tagName === 'P' || currentElement.tagName === 'H2') {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
    return false;
  };

  const hideTooltip = () => {
    setTooltip({ show: false, x: 0, y: 0, isScraped: false });
    setCurrentSelection(null);
  };

  const handleScrap = () => {
    if (!currentSelection) return;

    if (currentSelection.isAlreadyScraped) {
      deleteScrap(currentSelection.scrapId);
    } else {
      createScrap();
    }

    window.getSelection().removeAllRanges();
    hideTooltip();
  };

  const createScrap = () => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const contentElement = document.querySelector('.content');

    const startOffset = getTextOffset(contentElement, range.startContainer, range.startOffset);
    const endOffset = getTextOffset(contentElement, range.endContainer, range.endOffset);

    const isDuplicate = scrappedTexts.some(
      (item) => item.offset.start === startOffset && item.offset.end === endOffset
    );
    if (isDuplicate) return;

    const scrapId = Date.now().toString();
    const scrapItem = {
      id: scrapId,
      offset: { start: startOffset, end: endOffset },
      content: currentSelection.text,
      timestamp: new Date().toLocaleString('ko-KR'),
      url: window.location.href,
    };

    const newScraps = [...scrappedTexts, scrapItem];
    setScrappedTexts(newScraps);
    localStorage.setItem('scrappedTexts', JSON.stringify(newScraps));
  };

  const deleteScrap = (id) => {
    const newScraps = scrappedTexts.filter((item) => item.id != id);
    setScrappedTexts(newScraps);
    localStorage.setItem('scrappedTexts', JSON.stringify(newScraps));
  };

  const clearAllScraps = () => {
    setScrappedTexts([]);
    localStorage.setItem('scrappedTexts', JSON.stringify([]));
  };

  const getTextOffset = (root, node, offset) => {
    let textOffset = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let currentNode;
    while ((currentNode = walker.nextNode())) {
      if (currentNode === node) {
        return textOffset + offset;
      }
      textOffset += currentNode.textContent.length;
    }
    return textOffset;
  };

  const removeAllHighlights = () => {
    document.querySelectorAll('.highlight-scrap').forEach((highlight) => {
      const parent = highlight.parentNode;
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight);
      }
      parent.removeChild(highlight);
    });
    document.querySelectorAll('.content p, .content h2').forEach((el) => el.normalize());
  };

  const renderHighlightsFromOffsets = () => {
    const contentElement = document.querySelector('.content');
    if (!contentElement) return;

    const sortedScraps = [...scrappedTexts].sort((a, b) => a.offset.start - b.offset.start);
    const ranges = [];

    sortedScraps.forEach((item) => {
      const range = findRangeByOffset(contentElement, item.offset.start, item.offset.end);
      if (range) {
        ranges.push({ range, scrapId: item.id });
      }
    });

    ranges.reverse().forEach(({ range, scrapId }) => {
      try {
        const highlightSpan = document.createElement('b');
        highlightSpan.className = 'highlight-scrap';
        highlightSpan.dataset.scrapId = scrapId;
        range.surroundContents(highlightSpan);
      } catch (e) {
        try {
          const contents = range.extractContents();
          const highlightSpan = document.createElement('b');
          highlightSpan.className = 'highlight-scrap';
          highlightSpan.dataset.scrapId = scrapId;
          highlightSpan.appendChild(contents);
          range.insertNode(highlightSpan);
        } catch (err) {
          console.error('Failed to apply highlight:', err);
        }
      }
    });
  };

  const findRangeByOffset = (root, startOffset, endOffset) => {
    const range = document.createRange();
    let currentOffset = 0;
    let startNode = null;
    let startNodeOffset = 0;
    let endNode = null;
    let endNodeOffset = 0;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      const nodeLength = node.textContent.length;
      if (!startNode && currentOffset + nodeLength >= startOffset) {
        startNode = node;
        startNodeOffset = startOffset - currentOffset;
      }
      if (!endNode && currentOffset + nodeLength >= endOffset) {
        endNode = node;
        endNodeOffset = endOffset - currentOffset;
        break;
      }
      currentOffset += nodeLength;
    }

    if (startNode && endNode) {
      try {
        range.setStart(startNode, startNodeOffset);
        range.setEnd(endNode, endNodeOffset);
        return range;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  return (
    <div className="container">
      <header>
        <h1>텍스트 선택 & 스크랩 도구</h1>
        <p>아래 텍스트를 드래그하여 선택하면 툴팁이 나타납니다.</p>
      </header>

      <main>
        <article className="content">
          <p>
            인공지능(AI)은 인간의 학습능력, 추론능력, 지각능력, 언어이해능력 등을 컴퓨터 프로그램으로 실현한 기술입니다.
            최근 딥러닝 기술의 발전으로 AI는 이미지 인식, 음성 인식, 자연어 처리 등 다양한 분야에서 놀라운 성과를 보이고 있습니다.
            웹 개발은 크게 프론트엔드와 백엔드로 나뉩니다. 프론트엔드는 사용자가 직접 상호작용하는 부분을 담당하며,
            HTML, CSS, JavaScript를 주로 사용합니다. 백엔드는 서버, 데이터베이스, 애플리케이션 로직을 처리합니다.
            클라우드 컴퓨팅은 인터넷을 통해 IT 리소스를 온디맨드로 제공하고 사용한 만큼 비용을 지불하는 서비스입니다.
            AWS, Azure, Google Cloud 등이 대표적인 클라우드 서비스 제공업체입니다.
            클라우드를 통해 기업은 물리적 서버를 구매하고 유지 관리할 필요 없이 컴퓨팅 파워, 스토리지, 데이터베이스 등에 액세스할 수 있습니다.
          </p>
        </article>
      </main>

      <aside className="sidebar">
        <h3>📌 스크랩 목록</h3>
        <div className="scrap-list">
          {scrappedTexts.length === 0 ? (
            <p className="empty-message">아직 스크랩된 텍스트가 없습니다.</p>
          ) : (
            scrappedTexts.map((item) => (
              <div key={item.id} className="scrap-item" data-id={item.id}>
                <div className="scrap-content">
                  <p className="scrap-text">{item.content}</p>
                  <span className="scrap-time">{item.timestamp}</span>
                </div>
                <button className="delete-btn" onClick={() => deleteScrap(item.id)}>×</button>
              </div>
            ))
          )}
        </div>
        {scrappedTexts.length > 0 && (
          <button className="clear-btn" onClick={clearAllScraps}>모두 삭제</button>
        )}
      </aside>

      {tooltip.show && (
        <div
          className="tooltip"
          style={{
            display: 'block',
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            zIndex: 10000,
          }}
        >
          <button className={`scrap-btn ${tooltip.isScraped ? 'cancel-btn' : ''}`} onClick={handleScrap}>
            {tooltip.isScraped ? '🗑️ 스크랩 취소' : '📌 스크랩'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;