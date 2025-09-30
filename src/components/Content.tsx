import { useEffect, useState } from "react";
import { fetchHighlightedContent } from "../utils/scrapUtils";
import { renderContentWithHighlights } from "../utils/renderUtils";

export const Content = () => {
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    // 서버에서 content를 가져오는 걸 흉내
    const loadContent = async () => {
      const { content: highlightedContent } = await fetchHighlightedContent();
      setContent(highlightedContent);
    };

    loadContent();
  }, []);

  return (
    <main>
      <article className="content">
        <p>{renderContentWithHighlights(content)}</p>
      </article>
    </main>
  );
};
