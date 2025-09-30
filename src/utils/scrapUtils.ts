import { ScrapItem } from "../types";
import {
  HTML_TAGS,
  CSS_CLASSES,
  CONTENT_TEXT,
  STORAGE_KEYS,
} from "../constants";

/**
 * 문장 스크랩 목록을 <b> 태그가 포함된 content로 반환하는 함수
 */
export const formatScrapContent = (content: string): string => {
  return `<${HTML_TAGS.BOLD}>${content}</${HTML_TAGS.BOLD}>`;
};

/**
 * 문장 스크랩 목록의 모든 content를 <b> 태그로 감싸서 반환
 */
export const formatScrapList = (scraps: ScrapItem[]): ScrapItem[] => {
  return scraps.map((scrap) => ({
    ...scrap,
    content: formatScrapContent(scrap.content),
  }));
};

/**
 * @description 서버에서 콘텐츠를 내려주는 방식
 * 서버의 형태를 모방하여 구현함
 * 로컬 하이라이팅된 content를 <b> 태그 포함해서 반환하는 fetch 스타일 함수
 */
export const fetchHighlightedContent = async (): Promise<{
  content: string;
}> => {
  // 실제에서는 바로 하이라이팅이 포함된 content를 return

  return new Promise((resolve) => {
    // 먼저 localStorage에서 저장된 하이라이트 콘텐츠 확인
    const savedContent = loadHighlightedContent();
    if (savedContent && savedContent.includes(`<${HTML_TAGS.BOLD}`)) {
      resolve({ content: savedContent });
      return;
    }

    const contentElement = document.querySelector(`.${CSS_CLASSES.CONTENT}`);
    // DOM 요소가 있고 하이라이팅된 내용이 있으면 HTML 반환
    if (
      contentElement &&
      contentElement.innerHTML.includes(`<${HTML_TAGS.BOLD}`)
    ) {
      const htmlContent = contentElement.innerHTML;
      // DOM에서 가져온 하이라이트 콘텐츠를 localStorage에 저장
      saveHighlightedContent(htmlContent);
      resolve({ content: htmlContent });
      return;
    }

    // 그렇지 않으면 기본 콘텐츠 반환
    resolve({ content: CONTENT_TEXT.MAIN_CONTENT });
  });
};

/**
 * 하이라이트된 콘텐츠를 localStorage에 저장
 */
export const saveHighlightedContent = (content: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTED_CONTENT, content);
  } catch (error) {
    console.error("하이라이트 콘텐츠 저장 실패:", error);
  }
};

/**
 * localStorage에서 하이라이트된 콘텐츠를 불러오기
 */
export const loadHighlightedContent = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.HIGHLIGHTED_CONTENT);
  } catch (error) {
    console.error("하이라이트 콘텐츠 불러오기 실패:", error);
    return null;
  }
};

/**
 * @description 서버에 문장 스크랩을 저장하는 방식
 * 서버 요청 형태로 스크랩 데이터 저장
 */
export const saveScrapToServer = async (data: {
  content: string;
  offset: { start: number; end: number };
}): Promise<{ success: boolean; id: string }> => {
  return new Promise((resolve) => {
    // 실제로는 localStorage에 저장하지만 서버 요청 형태로 시뮬레이션
    const scrapId = Date.now().toString();

    // 데이터를 콘솔에 로그로 출력하여 사용
    console.log("문장 스크랩 저장 데이터:", data);

    // 실제 저장은 다른 곳에서 처리하고, 여기서는 응답만 반환
    setTimeout(() => {
      resolve({ success: true, id: scrapId });
    }, 100); // 네트워크 지연 시뮬레이션
  });
};
