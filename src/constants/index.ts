export const CSS_CLASSES = {
  HIGHLIGHT_SCRAP: "highlight-scrap",
  CONTENT: "content",
  CONTENT_SELECTORS: ".content p, .content h2",
} as const;

export const HTML_TAGS = {
  BOLD: "b",
} as const;

export const UI_TEXT = {
  HEADER_TITLE: "텍스트 선택 & 문장 스크랩 도구",
  HEADER_DESCRIPTION: "아래 텍스트를 드래그하여 선택하면 툴팁이 나타납니다.",
  SCRAP_LIST_TITLE: "📌 문장 스크랩 목록",
  EMPTY_MESSAGE: "아직 스크랩된 문장이 없습니다.",
  DELETE_BUTTON: "×",
  CLEAR_ALL_BUTTON: "모두 삭제",
} as const;

export const STORAGE_KEYS = {
  SCRAPPED_TEXTS: "scrappedSentences",
  HIGHLIGHTED_CONTENT: "highlightedContent",
} as const;

export const LOCALE = {
  KO_KR: "ko-KR",
} as const;

export const CONTENT_TEXT = {
  MAIN_CONTENT: `인공지능(AI)은 인간의 학습능력, 추론능력, 지각능력, 언어이해능력 등을 컴퓨터 프로그램으로 실현한 기술입니다.
          최근 딥러닝 기술의 발전으로 AI는 이미지 인식, 음성 인식, 자연어 처리 등 다양한 분야에서 놀라운 성과를 보이고 있습니다.
          웹 개발은 크게 프론트엔드와 백엔드로 나뉩니다. 프론트엔드는 사용자가 직접 상호작용하는 부분을 담당하며,
          HTML, CSS, JavaScript를 주로 사용합니다. 백엔드는 서버, 데이터베이스, 애플리케이션 로직을 처리합니다.
          클라우드 컴퓨팅은 인터넷을 통해 IT 리소스를 온디맨드로 제공하고 사용한 만큼 비용을 지불하는 서비스입니다.
          AWS, Azure, Google Cloud 등이 대표적인 클라우드 서비스 제공업체입니다.
          클라우드를 통해 기업은 물리적 서버를 구매하고 유지 관리할 필요 없이 컴퓨팅 파워, 스토리지, 데이터베이스 등에 액세스할 수 있습니다.`,
} as const;
