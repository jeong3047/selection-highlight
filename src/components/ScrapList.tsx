import { ScrapItem } from '../types';
import { UI_TEXT } from '../constants';

interface ScrapListProps {
  scraps: ScrapItem[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const ScrapList = ({ scraps, onDelete, onClearAll }: ScrapListProps) => {
  return (
    <aside className="sidebar">
      <h3>{UI_TEXT.SCRAP_LIST_TITLE}</h3>
      <div className="scrap-list">
        {scraps.length === 0 ? (
          <p className="empty-message">{UI_TEXT.EMPTY_MESSAGE}</p>
        ) : (
          scraps.map((item) => (
            <div key={item.id} className="scrap-item" data-id={item.id}>
              <div className="scrap-content">
                <p className="scrap-text">{item.content}</p>
                <span className="scrap-time">{item.timestamp}</span>
              </div>
              <button className="delete-btn" onClick={() => onDelete(item.id)}>
                {UI_TEXT.DELETE_BUTTON}
              </button>
            </div>
          ))
        )}
      </div>
      {scraps.length > 0 && (
        <button className="clear-btn" onClick={onClearAll}>
          {UI_TEXT.CLEAR_ALL_BUTTON}
        </button>
      )}
    </aside>
  );
};