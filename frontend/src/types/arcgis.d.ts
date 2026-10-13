/// <reference types="react" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "arcgis-map": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        basemap?: string;
        center?: [number, number];
        zoom?: number;
        onarcgisViewReadyChange?: (event: CustomEvent<void>) => void;
      };
      "arcgis-zoom": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        slot?: string;
      };
    }
  }
}