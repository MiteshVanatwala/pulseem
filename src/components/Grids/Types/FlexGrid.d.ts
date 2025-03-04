// components/Grids/Types/FlexGrid.d.ts
import { ReactNode } from 'react';

export interface FlexGridItem {
  component: ReactNode;
}

export interface FlexGridProps {
  gridArr: FlexGridItem[];
  textVariant: string;
  align: "center" | "left" | "right";
  justifyContent?: string;
}

declare const FlexGrid: React.FC<FlexGridProps>;
export default FlexGrid;