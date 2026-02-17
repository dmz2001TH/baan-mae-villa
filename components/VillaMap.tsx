"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import Link from "next/link";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Villa {
  id: string;
  name: string;
  slug: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  latitude: number | null;
  longitude: number | null;
  discountPercentage?: number;
}

interface VillaMapProps {
  villas: Villa[];
}

export default function VillaMap({ villas }: VillaMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter villas that have coordinates
  const villasWithCoords = villas.filter(
    (villa) => villa.latitude !== null && villa.longitude !== null
  );

  // Calculate center point (Pattaya area default)
  const centerLat = villasWithCoords.length > 0
    ? villasWithCoords.reduce((sum, v) => sum + (v.latitude || 0), 0) / villasWithCoords.length
    : 12.9236;
  const centerLng = villasWithCoords.length > 0
    ? villasWithCoords.reduce((sum, v) => sum + (v.longitude || 0), 0) / villasWithCoords.length
    : 100.8825;

  if (!isMounted) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  if (villasWithCoords.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No villas with location data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {villasWithCoords.map((villa) => (
          <Marker
            key={villa.id}
            position={[villa.latitude!, villa.longitude!]}
          >
            <Popup maxWidth={300} minWidth={250}>
              <div className="p-2">
                <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden">
                  <Image
                    src={villa.images[0] || "/placeholder-villa.jpg"}
                    alt={villa.name}
                    fill
                    className="object-cover"
                  />
                  {villa.discountPercentage && villa.discountPercentage > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                      -{villa.discountPercentage}%
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{villa.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                  📍 {villa.location}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                  <span>🛏️ {villa.bedrooms} beds</span>
                  <span>🚿 {villa.bathrooms} baths</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    {villa.discountPercentage && villa.discountPercentage > 0 ? (
                      <div>
                        <p className="text-xs text-gray-400 line-through">
                          ฿{villa.price.toLocaleString()}
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          ฿{(villa.price * (1 - villa.discountPercentage / 100)).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-blue-600">
                        ฿{villa.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/villas/${villa.slug}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
