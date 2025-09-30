import { ScrapItem } from "../types";
import { HTML_TAGS, CSS_CLASSES } from "../constants";

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
  return new Promise((resolve) => {
    const contentElement = document.querySelector(`.${CSS_CLASSES.CONTENT}`);
    if (!contentElement) {
      resolve({ content: "" });
      return;
    }

    // 하이라이팅된 요소들을 포함해서 HTML 내용 반환
    const htmlContent = contentElement.innerHTML;
    resolve({ content: htmlContent });
  });
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
