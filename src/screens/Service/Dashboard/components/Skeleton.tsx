import React from 'react';

interface Props {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: React.CSSProperties;
}

// Lightweight CSS shimmer placeholder (see .svc-skel in dashboard.css).
const Skeleton = ({ width = '100%', height = 14, radius = 6, style }: Props) => (
  <span
    className="svc-skel"
    style={{ display: 'block', width, height, borderRadius: radius, ...style }}
  />
);

export default Skeleton;
