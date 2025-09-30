import React, { ReactNode } from "react";
import { HTML_TAGS } from "../constants";

/**
 * HTML 문자열을 안전하게 React 요소로 변환하는 유틸 함수
 * dangerouslySetInnerHTML 대신 사용
 */
export const parseHTMLToReact = (htmlString: string): ReactNode[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlString}</div>`, "text/html");
  const container = doc.body.firstChild as HTMLElement;

  return Array.from(container.childNodes).map((node, index) =>
    convertNodeToReact(node, index)
  );
};

/**
 * DOM 노드를 React 요소로 변환
 */
const convertNodeToReact = (node: Node, key: number): ReactNode => {
  // 텍스트 노드
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  // 요소 노드
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    // 허용된 태그만 처리
    if (isAllowedTag(tagName)) {
      const props = getElementProps(element);
      const children = Array.from(element.childNodes).map((child, index) =>
        convertNodeToReact(child, index)
      );

      return React.createElement(tagName, { ...props, key }, ...children);
    }
  }

  return null;
};

/**
 * 허용된 HTML 태그인지 확인
 */
const isAllowedTag = (tagName: string): boolean => {
  const allowedTags = [
    "p",
    "div",
    "span",
    "b",
    "strong",
    "i",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ];
  return allowedTags.includes(tagName);
};

/**
 * 요소의 안전한 속성들만 추출
 */
const getElementProps = (element: HTMLElement): Record<string, any> => {
  const props: Record<string, any> = {};

  // className 속성 처리
  if (element.className) {
    props.className = element.className;
  }

  // data 속성 처리 (스크랩 ID용)
  if (element.dataset.scrapId) {
    props["data-scrap-id"] = element.dataset.scrapId;
  }

  return props;
};

/**
 * 텍스트와 하이라이트된 부분을 React 요소로 렌더링하는 함수
 */
export const renderContentWithHighlights = (content: string): ReactNode => {
  // <b> 태그가 포함된 HTML 문자열을 React 요소로 변환
  if (content.includes(`<${HTML_TAGS.BOLD}`)) {
    return parseHTMLToReact(content);
  }

  // 일반 텍스트는 그대로 반환
  return content;
};
