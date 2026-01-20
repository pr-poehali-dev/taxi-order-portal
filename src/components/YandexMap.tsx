import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';

interface Driver {
  id: number;
  name: string;
  rating: number;
  car: string;
  coords: number[];
}

interface YandexMapProps {
  drivers: Driver[];
  onAddressSelect?: (address: string, coords: number[], isFrom: boolean) => void;
  fromCoords?: number[] | null;
  toCoords?: number[] | null;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

const YandexMap = ({ drivers, onAddressSelect, fromCoords, toCoords }: YandexMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<'from' | 'to' | null>('from');

  useEffect(() => {
    const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
    
    if (existingScript) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU';
    script.async = true;
    script.onload = () => {
      initMap();
    };
    document.head.appendChild(script);
  }, []);

  const initMap = () => {
    if (!window.ymaps || !mapRef.current) return;

    window.ymaps.ready(() => {
      const ymap = new window.ymaps.Map(mapRef.current, {
        center: [55.751244, 37.618423],
        zoom: 12,
        controls: ['zoomControl', 'geolocationControl']
      });

      drivers.forEach((driver) => {
        const placemark = new window.ymaps.Placemark(
          driver.coords,
          {
            balloonContent: `<strong>${driver.name}</strong><br/>${driver.car}<br/>Рейтинг: ${driver.rating}`,
          },
          {
            preset: 'islands#blueCarIcon',
            iconColor: '#0EA5E9'
          }
        );
        ymap.geoObjects.add(placemark);
      });

      ymap.events.add('click', (e: any) => {
        if (!selecting) return;
        
        const coords = e.get('coords');
        window.ymaps.geocode(coords).then((res: any) => {
          const firstGeoObject = res.geoObjects.get(0);
          const address = firstGeoObject.getAddressLine();
          
          const isFrom = selecting === 'from';
          onAddressSelect?.(address, coords, isFrom);

          const placemark = new window.ymaps.Placemark(
            coords,
            { balloonContent: isFrom ? 'Откуда' : 'Куда' },
            { preset: isFrom ? 'islands#greenCircleIcon' : 'islands#redWayPointIcon' }
          );
          ymap.geoObjects.add(placemark);

          if (isFrom) {
            setSelecting('to');
          } else {
            setSelecting(null);
          }
        });
      });

      setMap(ymap);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (!map || !fromCoords || !toCoords) return;

    const multiRoute = new window.ymaps.multiRouter.MultiRoute(
      {
        referencePoints: [fromCoords, toCoords],
        params: { routingMode: 'auto' }
      },
      {
        boundsAutoApply: true,
        wayPointFinishIconColor: '#ea384c',
        wayPointStartIconColor: '#0EA5E9',
        routeActiveStrokeColor: '#0EA5E9'
      }
    );
    
    map.geoObjects.add(multiRoute);

    return () => {
      map.geoObjects.remove(multiRoute);
    };
  }, [map, fromCoords, toCoords]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Загрузка карты...</p>
          </div>
        </div>
      )}

      {selecting && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card shadow-lg rounded-lg px-4 py-2 border border-border">
          <p className="text-sm font-medium text-foreground">
            {selecting === 'from' ? 'Укажите точку отправления на карте' : 'Укажите точку назначения на карте'}
          </p>
        </div>
      )}
    </div>
  );
};

export default YandexMap;
