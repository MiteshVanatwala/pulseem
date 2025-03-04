// components/Grids/Types/NameValueGridStructure.d.ts
export interface NameValueGridItem {
  name: string;
  value: string | number;
  classes: {
    name: string;
    value: string;
    href: string;
  };
  onClick: (e: any) => void;
}

export interface NameValueGridStructureProps {
  gridArr: Array<NameValueGridItem>; // Changed this
  variant: string;
  gridSize: {
    xs: number;
    sm: number;
  };
  rootClass?: string;
}

declare const NameValueGridStructure: React.FC<NameValueGridStructureProps>;
export default NameValueGridStructure;