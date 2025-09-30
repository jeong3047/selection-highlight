import { useTextSelection } from "./hooks/useTextSelection";
import { useScraps } from "./hooks/useScraps";
import { getTextOffset } from "./utils/textUtils";
import { saveScrapToServer } from "./utils/scrapUtils";
import { Tooltip } from "./components/Tooltip";
import { ScrapList } from "./components/ScrapList";
import { Content } from "./components/Content";
import { CSS_CLASSES, UI_TEXT, LOCALE } from "./constants";
import "./style.css";

function App() {
  const { tooltip, currentSelection, hideTooltip } = useTextSelection();
  const { scrappedTexts, addScrap, deleteScrap, clearAllScraps, isDuplicate } =
    useScraps();

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

  const createScrap = async () => {
    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);
    const contentElement = document.querySelector(`.${CSS_CLASSES.CONTENT}`);
    if (!contentElement) return;

    const startOffset = getTextOffset(
      contentElement,
      range.startContainer,
      range.startOffset
    );
    const endOffset = getTextOffset(
      contentElement,
      range.endContainer,
      range.endOffset
    );

    if (isDuplicate(startOffset, endOffset)) return;

    // 서버 요청 형태로 문장 스크랩 데이터 전송
    const scrapData = {
      content: currentSelection?.text || "",
      offset: { start: startOffset, end: endOffset },
    };

    try {
      const response = await saveScrapToServer(scrapData);

      if (response.success) {
        const scrapItem = {
          id: response.id,
          offset: { start: startOffset, end: endOffset },
          content: currentSelection?.text || "",
          timestamp: new Date().toLocaleString(LOCALE.KO_KR),
          url: window.location.href,
        };

        addScrap(scrapItem);
      }
    } catch (error) {
      console.error("Failed to save sentence scrap:", error);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>{UI_TEXT.HEADER_TITLE}</h1>
        <p>{UI_TEXT.HEADER_DESCRIPTION}</p>
      </header>
      <Content />
      <ScrapList
        scraps={scrappedTexts}
        onDelete={deleteScrap}
        onClearAll={clearAllScraps}
      />
      <Tooltip tooltip={tooltip} onScrap={handleScrap} />
    </div>
  );
}

export default App;
