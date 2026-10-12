
import { useRef, useEffect } from "react";

import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";

import esriConfig from "@arcgis/core/config.js";
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";

import { mockLocations } from "../data/mockLocations";

if (import.meta.env.VITE_ARCGIS_API_KEY) {
    esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;
}

interface MapViewProps {
  locations: typeof mockLocations;
  center?: [number, number];
}

export default function MapView({ locations, center = [-48.845, -26.304] }: MapViewProps) {
    const layerAdded = useRef(false);
    const mapElementRef = useRef<HTMLElement & { map: { add: (layer: GraphicsLayer) => void; remove: (layer: GraphicsLayer) => void; layers: { removeAll: () => void } } }>(null);

    const renderLocations = (mapElement: typeof mapElementRef.current) => {
      if (!mapElement?.map) return;

      mapElement.map.layers.removeAll();

      const locationsLayer = new GraphicsLayer({
        title: "Localizações de demonstração",
      });

      locations.forEach((location) => {
        const point = new Point({
          longitude: location.longitude,
          latitude: location.latitude,
          spatialReference: { wkid: 4326 },
        });

        const graphic = new Graphic({
          geometry: point,
          attributes: {
            id: location.id,
            name: location.name,
            description: location.description,
            type: location.type,
          },
          symbol: {
            type: "simple-marker",
            color: [0, 112, 224, 0.9],
            size: 12,
            outline: {
              color: [255, 255, 255, 1],
              width: 2,
            },
          },
          popupTemplate: {
            title: "{name}",
            content: "{description}",
          },
        });

        locationsLayer.add(graphic);
      });

      mapElement.map.add(locationsLayer);
    };

    const handleMapReady = (event: CustomEvent<void>) => {
      if (layerAdded.current) return;

      const mapElement = event.target as typeof mapElementRef.current;
      mapElementRef.current = mapElement;

      if (!mapElement?.map) return;

      renderLocations(mapElement);
      layerAdded.current = true;
    };

    useEffect(() => {
      if (mapElementRef.current?.map) {
        renderLocations(mapElementRef.current);
      }
    }, [locations]);

    return (
      <arcgis-map
        ref={mapElementRef}
        className="map-component"
        basemap="arcgis/topographic"
        center={center}
        zoom={13}
        onarcgisViewReadyChange={handleMapReady}
      >
        <arcgis-zoom slot="top-left" />
      </arcgis-map>
    );
}
