// ============================================
// 전역 상태 관리
// ============================================
let scrappedTexts = [];
let tooltip = null;
let currentSelection = null;
let isHighlightClick = false;

// ============================================
// 초기화
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  tooltip = document.getElementById("tooltip");
  const scrapBtn = document.getElementById("scrapBtn");
  const clearAllBtn = document.getElementById("clearAll");

  setupEventListeners(scrapBtn, clearAllBtn);
  loadScrapsFromStorage();
  restoreHighlights();
}

function setupEventListeners(scrapBtn, clearAllBtn) {
  document.addEventListener("mouseup", handleTextSelection);
  document.addEventListener("click", handleDocumentClick, false);
  document.addEventListener("click", handleHighlightClick, true);
  scrapBtn.addEventListener("click", handleScrap);
  clearAllBtn.addEventListener("click", clearAllScraps);
}

function handleDocumentClick(e) {
  const isHighlight =
    e.target.classList?.contains("highlight-scrap") ||
    e.target.closest(".highlight-scrap");

  if (!tooltip.contains(e.target) && !isHighlight) {
    hideTooltip();
  }
}

// ============================================
// 텍스트 선택 및 툴팁 관리
// ============================================
function handleTextSelection() {
  setTimeout(() => {
    if (isHighlightClick) {
      isHighlightClick = false;
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0) {
      if (!isInAllowedElement(selection.getRangeAt(0).startContainer)) {
        hideTooltip();
        return;
      }

      currentSelection = {
        text: selectedText,
        isAlreadyScraped: false,
        scrapId: null,
      };

      showTooltip(selection);
    } else {
      hideTooltip();
    }
  }, 10);
}

function isInAllowedElement(startContainer) {
  let currentElement =
    startContainer.nodeType === 3
      ? startContainer.parentElement
      : startContainer;

  while (currentElement && currentElement !== document.body) {
    if (currentElement.tagName === "P" || currentElement.tagName === "H2") {
      return true;
    }
    currentElement = currentElement.parentElement;
  }
  return false;
}

function showTooltip(selection) {
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  updateTooltipButton(currentSelection.isAlreadyScraped);
  positionTooltip(rect);
}

function updateTooltipButton(isScraped) {
  const scrapBtn = document.getElementById("scrapBtn");
  if (isScraped) {
    scrapBtn.textContent = "🗑️ 스크랩 취소";
    scrapBtn.className = "scrap-btn cancel-btn";
  } else {
    scrapBtn.textContent = "📌 스크랩";
    scrapBtn.className = "scrap-btn";
  }
}

function positionTooltip(rect) {
  tooltip.style.display = "block";
  tooltip.style.position = "fixed";
  tooltip.style.zIndex = "10000";
  tooltip.style.visibility = "visible";
  tooltip.style.left = `${rect.left + rect.width / 2 - 40}px`;
  tooltip.style.top = `${rect.top - 45}px`;

  if (rect.top - 45 < 0) {
    tooltip.style.top = `${rect.bottom + 10}px`;
  }

  tooltip.style.opacity = "1";
}

function hideTooltip() {
  if (tooltip) {
    tooltip.style.display = "none";
    currentSelection = null;
  }
}

// ============================================
// 하이라이트 클릭 처리
// ============================================
function handleHighlightClick(e) {
  const highlightElement = e.target.classList?.contains("highlight-scrap")
    ? e.target
    : e.target.closest(".highlight-scrap");

  if (highlightElement) {
    isHighlightClick = true;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const scrapId = highlightElement.dataset.scrapId;
    const rect = highlightElement.getBoundingClientRect();

    currentSelection = {
      text: highlightElement.textContent,
      isAlreadyScraped: true,
      scrapId: scrapId,
    };

    showTooltipAtPosition(rect);
    return false;
  }
}

function showTooltipAtPosition(rect) {
  updateTooltipButton(true);
  positionTooltip(rect);
}

// ============================================
// 스크랩 CRUD 작업
// ============================================
function handleScrap() {
  if (!currentSelection) return;

  if (currentSelection.isAlreadyScraped) {
    deleteScrap(currentSelection.scrapId);
  } else {
    createScrap();
  }

  window.getSelection().removeAllRanges();
  hideTooltip();
}

function createScrap() {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const contentElement = document.querySelector(".content");

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

  if (isDuplicateScrap(startOffset, endOffset)) {
    return;
  }

  const highlightSpan = createHighlightElement();
  applyHighlight(range, highlightSpan);

  const scrapItem = createScrapItem(highlightSpan, startOffset, endOffset);
  scrappedTexts.push(scrapItem);

  saveScrapsToStorage();
  updateScrapList();
}

function isDuplicateScrap(startOffset, endOffset) {
  return scrappedTexts.some(
    (item) => item.offset.start === startOffset && item.offset.end === endOffset
  );
}

function createHighlightElement() {
  const highlightSpan = document.createElement("b");
  highlightSpan.className = "highlight-scrap";
  highlightSpan.dataset.scrapId = Date.now();
  return highlightSpan;
}

function applyHighlight(range, highlightSpan) {
  try {
    range.surroundContents(highlightSpan);
  } catch (e) {
    const contents = range.extractContents();
    highlightSpan.appendChild(contents);
    range.insertNode(highlightSpan);
  }
}

function createScrapItem(highlightSpan, startOffset, endOffset) {
  return {
    id: highlightSpan.dataset.scrapId,
    offset: {
      start: startOffset,
      end: endOffset,
    },
    content: highlightSpan.outerHTML,
    timestamp: new Date().toLocaleString("ko-KR"),
    url: window.location.href,
  };
}

function deleteScrap(id) {
  scrappedTexts = scrappedTexts.filter((item) => item.id != id);
  saveScrapsToStorage();
  updateScrapList();
  reRenderAllHighlights();
}

function clearAllScraps() {
  removeAllHighlights();
  scrappedTexts = [];
  saveScrapsToStorage();
  updateScrapList();
}

// ============================================
// UI 업데이트
// ============================================
function updateScrapList() {
  const scrapList = document.getElementById("scrapList");
  const clearAllBtn = document.getElementById("clearAll");

  if (scrappedTexts.length === 0) {
    scrapList.innerHTML =
      '<p class="empty-message">아직 스크랩된 텍스트가 없습니다.</p>';
    clearAllBtn.style.display = "none";
    return;
  }

  clearAllBtn.style.display = "block";
  scrapList.innerHTML = generateScrapListHTML();
}

function generateScrapListHTML() {
  return scrappedTexts
    .map((item) => {
      const textContent = extractTextFromContent(item);
      const escapedText = escapeHTML(textContent);

      return `
        <div class="scrap-item" data-id="${item.id}">
          <div class="scrap-content">
            <p class="scrap-text">${escapedText}</p>
            <span class="scrap-time">${item.timestamp}</span>
          </div>
          <button class="delete-btn" onclick="deleteScrap(${item.id})">×</button>
        </div>
      `;
    })
    .join("");
}

function extractTextFromContent(item) {
  return item.content ? item.content.replace(/<[^>]*>/g, "") : item.text || "";
}

function escapeHTML(text) {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ============================================
// 하이라이트 렌더링
// ============================================
function restoreHighlights() {
  renderHighlightsFromOffsets();
}

function reRenderAllHighlights() {
  removeAllHighlights();
  renderHighlightsFromOffsets();
}

function removeAllHighlights() {
  document.querySelectorAll(".highlight-scrap").forEach((highlight) => {
    const parent = highlight.parentNode;
    while (highlight.firstChild) {
      parent.insertBefore(highlight.firstChild, highlight);
    }
    parent.removeChild(highlight);
  });

  document.querySelectorAll(".content p, .content h2").forEach((el) => {
    el.normalize();
  });
}

function renderHighlightsFromOffsets() {
  const contentElement = document.querySelector(".content");
  const fullText = contentElement.textContent;

  // 오프셋 기반으로 정렬된 스크랩 목록
  const sortedScraps = [...scrappedTexts].sort((a, b) => {
    if (!a.offset || !b.offset) return 0;
    return a.offset.start - b.offset.start;
  });

  // 각 스크랩의 실제 위치 찾기 및 Range 생성
  const ranges = [];
  sortedScraps.forEach((item) => {
    if (!item.offset) return;

    const textContent = item.content
      ? item.content.replace(/<[^>]*>/g, "")
      : item.text;
    const range = findRangeByOffset(
      contentElement,
      item.offset.start,
      item.offset.end
    );

    if (range) {
      ranges.push({ range, scrapId: item.id });
    }
  });

  // 역순으로 하이라이트 적용 (뒤에서부터 적용해야 오프셋이 변하지 않음)
  ranges.reverse().forEach(({ range, scrapId }) => {
    try {
      const highlightSpan = document.createElement("b");
      highlightSpan.className = "highlight-scrap";
      highlightSpan.dataset.scrapId = scrapId;

      range.surroundContents(highlightSpan);
    } catch (e) {
      // 범위가 여러 요소에 걸쳐있는 경우
      try {
        const contents = range.extractContents();
        const highlightSpan = document.createElement("b");
        highlightSpan.className = "highlight-scrap";
        highlightSpan.dataset.scrapId = scrapId;
        highlightSpan.appendChild(contents);
        range.insertNode(highlightSpan);
      } catch (err) {
        console.error("Failed to apply highlight:", err);
      }
    }
  });
}

function findRangeByOffset(root, startOffset, endOffset) {
  const range = document.createRange();
  let currentOffset = 0;
  let startNode = null;
  let startNodeOffset = 0;
  let endNode = null;
  let endNodeOffset = 0;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

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
      console.error("Failed to create range:", e);
      return null;
    }
  }

  return null;
}

// ============================================
// 로컬 스토리지 관리
// ============================================
function saveScrapsToStorage() {
  localStorage.setItem("scrappedTexts", JSON.stringify(scrappedTexts));
}

function loadScrapsFromStorage() {
  const saved = localStorage.getItem("scrappedTexts");
  if (!saved) return;

  scrappedTexts = JSON.parse(saved);
  migrateOldDataFormat();
  updateScrapList();
}

function migrateOldDataFormat() {
  let needsMigration = false;

  scrappedTexts = scrappedTexts.map((item) => {
    if (!item.offset && item.text) {
      needsMigration = true;
      return {
        ...item,
        offset: { start: 0, end: item.text.length },
        content: `<b class="highlight-scrap" data-scrap-id="${item.id}">${item.text}</b>`,
      };
    }
    return item;
  });

  if (needsMigration) {
    saveScrapsToStorage();
  }
}

// ============================================
// 유틸리티 함수
// ============================================
function getTextOffset(root, node, offset) {
  let textOffset = 0;
  let walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let currentNode;
  while ((currentNode = walker.nextNode())) {
    if (currentNode === node) {
      return textOffset + offset;
    }
    textOffset += currentNode.textContent.length;
  }
  return textOffset;
}
