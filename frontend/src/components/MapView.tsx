
import { useRef } from "react";

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

export default function MapView() {
    const layerAdded = useRef(false);

    const handleMapReady = (event: CustomEvent<void>) => {
        if (layerAdded.current) return;

        const mapElement = event.target as HTMLElement & {
            map: {
                add: (layer: GraphicsLayer) => void;
            };
        };

        if (!mapElement.map) return;

        const locationsLayer = new GraphicsLayer({
            title: "Localizações de demonstração",
        });

        mockLocations.forEach((location) => {
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
        layerAdded.current = true;
    };

    return (
        <arcgis-map
            className="map-component"
            basemap="arcgis/topographic"
            center="-48.845, -26.304"
            zoom={13}
            onarcgisViewReadyChange={handleMapReady}
        >
            <arcgis-zoom slot="top-left" />
        </arcgis-map>
    );
}
