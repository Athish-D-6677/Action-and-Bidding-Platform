import React from 'react';

export default function DevFooter({ screenNum, screenName, subLabel }) {
  if (process.env.REACT_APP_HIDE_DEV_FOOTER === 'true') return null;
  return (
    <div className="dev-footer">
      <span>{String(screenNum).padStart(2,'0')} — {screenName} / {subLabel}</span>
      <span>Auction &amp; Bidding Platform System · UI/UX Concept</span>
    </div>
  );
}
