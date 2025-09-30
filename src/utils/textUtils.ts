/**
 * DOM 요소가 선택 가능한 영역인지 확인
 */
export const isInAllowedElement = (startContainer: Node): boolean => {
  let currentElement = startContainer.nodeType === 3
    ? startContainer.parentElement
    : (startContainer as HTMLElement);

  while (currentElement && currentElement !== document.body) {
    if (currentElement.tagName === 'P' || currentElement.tagName === 'H2') {
      return true;
    }
    currentElement = currentElement.parentElement;
  }
  return false;
};

/**
 * 텍스트 노드의 절대 오프셋 계산
 */
export const getTextOffset = (root: Element, node: Node, offset: number): number => {
  let textOffset = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);

  let currentNode;
  while ((currentNode = walker.nextNode())) {
    if (currentNode === node) {
      return textOffset + offset;
    }
    textOffset += currentNode.textContent?.length || 0;
  }
  return textOffset;
};

/**
 * 오프셋 기반으로 Range 찾기
 */
export const findRangeByOffset = (
  root: Element,
  startOffset: number,
  endOffset: number
): Range | null => {
  const range = document.createRange();
  let currentOffset = 0;
  let startNode: Node | null = null;
  let startNodeOffset = 0;
  let endNode: Node | null = null;
  let endNodeOffset = 0;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);

  let node;
  while ((node = walker.nextNode())) {
    const nodeLength = node.textContent?.length || 0;

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