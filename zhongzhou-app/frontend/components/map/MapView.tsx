"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import AMapLoader from "@amap/amap-jsapi-loader";
import { useLocaleStore } from "@/stores/localeStore";
import type { Spot } from "@/lib/spots";

interface AMapObject {
  getPosition: () => { lng: number; lat: number };
  getExtData: () => { spotId?: string } | null;
  close: () => void;
  open: (map: AMapObject, pos: { lng: number; lat: number }) => void;
  destroy: () => void;
  setCenter: (pos: [number, number]) => void;
  setZoom: (zoom: number, immediately?: boolean, duration?: number) => void;
  add: (obj: AMapObject) => void;
  addControl: (ctrl: AMapObject) => void;
  on: (event: string, handler: () => void) => void;
}

interface MapViewProps {
  spots: Spot[];
  activeSpotId: string | null;
  onSpotClick: (spotId: string) => void;
}

export default function MapView({ spots, activeSpotId, onSpotClick }: MapViewProps) {
  const { locale } = useLocaleStore();
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<AMapObject | null>(null);
  const markersRef = useRef<AMapObject[]>([]);
  const infoWindowRef = useRef<AMapObject | null>(null);

  const openInfoWindow = useCallback(
    (map: AMapObject, marker: AMapObject, spot: Spot) => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      const content = `
        <div style="padding:12px;min-width:200px;font-family:system-ui,-apple-system,sans-serif;">
          <div style="font-weight:bold;font-size:15px;color:#1a1a1a;margin-bottom:4px;">
            ${spot.name[locale]}
          </div>
          <div style="font-size:12px;color:#888;margin-bottom:8px;">
            ${spot.subtitle[locale]}
          </div>
          <a onclick="event.preventDefault(); window.location.assign('/spots/${spot.id}?from=map')" style="display:inline-block;padding:4px 12px;background:#c23b22;color:#fff;font-size:12px;border-radius:3px;text-decoration:none;cursor:pointer;">
            ${locale === "zh" ? "查看详情" : "View Details"}
          </a>
        </div>
      `;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const infoWindow = new (window as any).AMap.InfoWindow({
        content,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        offset: new (window as any).AMap.Pixel(0, -40),
        closeWhenClickMap: true,
      });

      infoWindow.open(map, marker.getPosition());
      infoWindowRef.current = infoWindow;
    },
    [locale]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const key = process.env.NEXT_PUBLIC_AMAP_KEY;
    if (!key) {
      console.warn("NEXT_PUBLIC_AMAP_KEY is not set");
      return;
    }

    // Must set security config before load
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)._AMapSecurityConfig = {
      securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_KEY,
    };

    let map: AMapObject;

    AMapLoader.load({
      key,
      version: "2.0",
      plugins: ["AMap.Scale", "AMap.Geolocation"],
    })
      .then((AMap) => {
        map = new AMap.Map(containerRef.current!, {
          zoom: 13,
          center: [116.3972, 39.91],
          mapStyle: "amap://styles/whitesmoke",
        });

        map.addControl(new AMap.Scale());
        mapRef.current = map;
        setLoaded(true);

        // Geolocation control (bottom-right)
        const geolocation = new AMap.Geolocation({
          position: "RB",
          offset: [20, 20],
          showCircle: true,
          showMarker: true,
          zoomToAccuracy: true,
        });
        map.addControl(geolocation);

        // Add spot markers
        spots.forEach((spot) => {
          const marker = new AMap.Marker({
            position: [spot.location.lng, spot.location.lat],
            title: spot.name[locale],
            offset: new AMap.Pixel(-12, -30),
            extData: { spotId: spot.id },
          });

          marker.on("click", () => {
            map.setCenter([spot.location.lng, spot.location.lat]);
            map.setZoom(15, false, 500);
            openInfoWindow(map, marker, spot);
            onSpotClick(spot.id);
          });

          map.add(marker);
          markersRef.current.push(marker);
        });
      })
      .catch((e) => console.error("AMap load failed:", e));

    return () => {
      map?.destroy();
    };
  }, [spots, locale, openInfoWindow, onSpotClick]);

  // Fly to spot when activeSpotId changes
  useEffect(() => {
    if (!activeSpotId || !mapRef.current) return;
    const spot = spots.find((s) => s.id === activeSpotId);
    if (!spot) return;

    mapRef.current.setCenter([spot.location.lng, spot.location.lat]);
    mapRef.current.setZoom(15, false, 500);

    const marker = markersRef.current.find(
      (m) => m.getExtData()?.spotId === activeSpotId
    );
    if (marker) {
      openInfoWindow(mapRef.current, marker, spot);
    }
  }, [activeSpotId, spots, openInfoWindow]);

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-charcoal/5">
          <span className="text-charcoal/30 font-body text-sm">
            {locale === "zh" ? "地图加载中..." : "Loading map..."}
          </span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
