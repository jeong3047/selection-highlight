import { TooltipState } from '../types';

interface TooltipProps {
  tooltip: TooltipState;
  onScrap: () => void;
}

export const Tooltip = ({ tooltip, onScrap }: TooltipProps) => {
  if (!tooltip.show) return null;

  return (
    <div
      className="tooltip"
      style={{
        display: 'block',
        position: 'fixed',
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
        zIndex: 10000,
      }}
    >
      <button className={`scrap-btn ${tooltip.isScraped ? 'cancel-btn' : ''}`} onClick={onScrap}>
        {tooltip.isScraped ? '🗑️ 스크랩 취소' : '📌 스크랩'}
      </button>
    </div>
  );
};