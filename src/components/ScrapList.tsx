import { ScrapItem } from '../types';

interface ScrapListProps {
  scraps: ScrapItem[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const ScrapList = ({ scraps, onDelete, onClearAll }: ScrapListProps) => {
  return (
    <aside className="sidebar">
      <h3>📌 스크랩 목록</h3>
      <div className="scrap-list">
        {scraps.length === 0 ? (
          <p className="empty-message">아직 스크랩된 텍스트가 없습니다.</p>
        ) : (
          scraps.map((item) => (
            <div key={item.id} className="scrap-item" data-id={item.id}>
              <div className="scrap-content">
                <p className="scrap-text">{item.content}</p>
                <span className="scrap-time">{item.timestamp}</span>
              </div>
              <button className="delete-btn" onClick={() => onDelete(item.id)}>
                ×
              </button>
            </div>
          ))
        )}
      </div>
      {scraps.length > 0 && (
        <button className="clear-btn" onClick={onClearAll}>
          모두 삭제
        </button>
      )}
    </aside>
  );
};