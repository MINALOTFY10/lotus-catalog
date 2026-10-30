import React from 'react';

interface VerticalHeadlineProps {
  /** Big line, the one closest to the cards (inside). */
  title?: string | null;
  /** Small light line on the page edge (outside). */
  subtitle?: string;
}

/**
 * Sizes and weights come from the Canva "Arabic lotus Pricelist" page:
 * one text box rotated -90deg, line 1 = "قائمة اسعار" (39.96px, light),
 * line 2 = section title (50.62px, medium). Canva px * 0.7494 = our units (--u).
 */
const SUBTITLE = { size: 30, weight: 300 };
const TITLE = { size: 38, weight: 500 };

/** Where the text starts from the top of the page. */
const START_Y = 140;
/** Baselines (left to right). Outside line first, inside line second. */
const SUBTITLE_BASELINE_X = 56;
const TITLE_BASELINE_X = 100;

const textStyle = (size: number, weight: number): React.CSSProperties => ({
  fontFamily: 'var(--mag-font-ar)',
  fontSize: size,
  fontWeight: weight,
  fill: 'var(--mag-text)',
});

export function VerticalHeadline({
  title,
  subtitle = 'قائمة اسعار',
}: VerticalHeadlineProps) {
  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      viewBox="0 0 134 842"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      {/* rotate(-90): local x = -screen y, local y = screen x */}
      <g transform="rotate(-90)">
        {/* Outside line (page edge) */}
        <text
          x={-START_Y}
          y={SUBTITLE_BASELINE_X}
          direction="rtl"
          textAnchor="start"
          style={textStyle(SUBTITLE.size, SUBTITLE.weight)}
        >
          {subtitle}
        </text>

        {/* Inside line (next to the cards) */}
        {title && (
          <text
            x={-START_Y}
            y={TITLE_BASELINE_X}
            direction="rtl"
            textAnchor="start"
            style={textStyle(TITLE.size, TITLE.weight)}
          >
            {title}
          </text>
        )}
      </g>
    </svg>
  );
}
