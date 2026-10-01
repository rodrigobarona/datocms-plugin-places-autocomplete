import { useEffect, useRef } from 'react';
import { Map as MapLibreMap, Marker, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './LocationMap.module.css';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/bright';
const PIN_ZOOM = 16;

let workerConfigured = false;

/**
 * The worker files are copied next to index.html, and the plugin is served
 * from a versioned CDN folder, so the URL must be relative to the document.
 */
function configureWorker(): void {
  if (!workerConfigured) {
    setWorkerUrl(new URL('./maplibre-gl-worker.mjs', document.baseURI).href);
    workerConfigured = true;
  }
}

type LocationMapProps = {
  lat: number;
  lng: number;
};

export default function LocationMap({ lat, lng }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const initialCenterRef = useRef<[number, number]>([lng, lat]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    configureWorker();
    const center = initialCenterRef.current;
    const map = new MapLibreMap({
      container,
      style: MAP_STYLE,
      center,
      zoom: PIN_ZOOM,
      interactive: false,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    markerRef.current = new Marker({ color: '#e5484d' }).setLngLat(center).addTo(map);

    return () => {
      markerRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    markerRef.current?.setLngLat([lng, lat]);
    mapRef.current?.jumpTo({ center: [lng, lat], zoom: PIN_ZOOM });
  }, [lat, lng]);

  return <div ref={containerRef} className={styles.map} />;
}
