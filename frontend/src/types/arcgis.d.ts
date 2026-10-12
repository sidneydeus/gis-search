import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "arcgis-map": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        basemap?: string;
        center?: [number, number] | string;
        zoom?: number;
        onarcgisViewReadyChange?: (event: CustomEvent<void>) => void;
        ref?: React.RefObject<HTMLElement & { map: { add: (layer: any) => void; remove: (layer: any) => void; layers: { removeAll: () => void } } }>;
      };
      "arcgis-zoom": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        slot?: string;
      };
    }
  }
}