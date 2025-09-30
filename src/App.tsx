import { useTextSelection } from './hooks/useTextSelection';
import { useScraps } from './hooks/useScraps';
import { getTextOffset } from './utils/textUtils';
import { Tooltip } from './components/Tooltip';
import { ScrapList } from './components/ScrapList';
import { Content } from './components/Content';
import './style.css';

function App() {
  const { tooltip, currentSelection, hideTooltip } = useTextSelection();
  const { scrappedTexts, addScrap, deleteScrap, clearAllScraps, isDuplicate } = useScraps();

  const handleScrap = () => {
    if (!currentSelection) return;

    if (currentSelection.isAlreadyScraped) {
      if (currentSelection.scrapId) {
        deleteScrap(currentSelection.scrapId);
      }
    } else {
      createScrap();
    }

    window.getSelection()?.removeAllRanges();
    hideTooltip();
  };

  const createScrap = () => {
    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);
    const contentElement = document.querySelector('.content');
    if (!contentElement) return;

    const startOffset = getTextOffset(contentElement, range.startContainer, range.startOffset);
    const endOffset = getTextOffset(contentElement, range.endContainer, range.endOffset);

    if (isDuplicate(startOffset, endOffset)) return;

    const scrapId = Date.now().toString();
    const scrapItem = {
      id: scrapId,
      offset: { start: startOffset, end: endOffset },
      content: currentSelection?.text || '',
      timestamp: new Date().toLocaleString('ko-KR'),
      url: window.location.href,
    };

    addScrap(scrapItem);
  };

  return (
    <div className="container">
      <header>
        <h1>텍스트 선택 & 스크랩 도구</h1>
        <p>아래 텍스트를 드래그하여 선택하면 툴팁이 나타납니다.</p>
      </header>

      <Content />
      <ScrapList scraps={scrappedTexts} onDelete={deleteScrap} onClearAll={clearAllScraps} />
      <Tooltip tooltip={tooltip} onScrap={handleScrap} />
    </div>
  );
}

export default App;