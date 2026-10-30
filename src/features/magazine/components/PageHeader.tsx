import React from 'react';

/**
 * Header with the Lotus logo and the Fund seal as two separate images.
 * Positions and sizes come from the Canva "Arabic lotus Pricelist" page
 * (794px wide page). Canva px * 0.7494 = our units (--u, page = 595u).
 */
const LOGO = { left: 225.5, top: 15.8, width: 98.0, height: 108.1 };
const SEAL = { left: 364.6, top: 17.6, width: 107.9, height: 106.3 };

const frame = (box: typeof LOGO): React.CSSProperties => ({
  position: 'absolute',
  left: `calc(${box.left} * var(--u, 1px))`,
  top: `calc(${box.top} * var(--u, 1px))`,
  width: `calc(${box.width} * var(--u, 1px))`,
  height: `calc(${box.height} * var(--u, 1px))`,
});

export function PageHeader() {
  return (
    <header
      className="absolute top-0 left-0 w-full pointer-events-none select-none z-10 overflow-hidden"
      style={{ height: 'calc(142 * var(--u, 1px))' }}
    >
      <img
        src="/brand/lotus_logo.png"
        alt="لوتس"
        className="block object-contain"
        style={frame(LOGO)}
      />
      <img
        src="/brand/fund_seal_header.webp"
        alt="صندوق دعم الصناعات"
        className="block object-contain"
        style={frame(SEAL)}
      />
    </header>
  );
}
