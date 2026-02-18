import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../lib/supabase';

// Fix for default Leaflet marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Rider Icon
const riderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  iconSize: [45, 45],
  iconAnchor: [22, 22],
});

/**
 * MapRecenter Component
 * Automatically pans the map when positions change
 */
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.panTo(center);
  }, [center, map]);
  return null;
}

export default function LiveTrackingMap({ orderId }) {
  const [deliveryPos, setDeliveryPos] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncLogistics = useCallback(async () => {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select(`status, address, user_id`)
      .eq('id', orderId)
      .single();

    if (order) {
      // 1. Fetch User Destination
      const { data: addrData } = await supabase
        .from('addresses')
        .select('lat, lng')
        .eq('user_id', order.user_id) // Match by user_id for better reliability
        .eq('is_primary', true)
        .maybeSingle();

      // 2. Fetch Store Origin with hardcoded fallback to prevent infinite loading
      const { data: settings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'store_location')
        .maybeSingle();

      // DEFAULT FALLBACK: Kudwa, Maharashtra coordinates if DB is empty
      const defaultLat = 21.4586; 
      const defaultLng = 80.2201;

      const uPos = addrData ? [parseFloat(addrData.lat), parseFloat(addrData.lng)] : [defaultLat, defaultLng];
      const sPos = settings?.value ? [parseFloat(settings.value.lat), parseFloat(settings.value.lng)] : [defaultLat - 0.01, defaultLng - 0.01];
      
      setUserPos(uPos);

      // Simulation logic
      if (order.status === 'Out for Delivery') {
        setDeliveryPos([uPos[0] - 0.002, uPos[1] - 0.002]);
      } else {
        setDeliveryPos(sPos);
      }
    }
  } catch (err) {
    console.error("Logistics Sync Error:", err.message);
  } finally {
    setLoading(false); // Force loading off even if data is partial
  }
}, [orderId]);

  useEffect(() => {
    syncLogistics();
    const channel = supabase.channel(`live_map_${orderId}`)
      .on('postgres_changes', { event: 'UPDATE', table: 'orders', filter: `id=eq.${orderId}` }, syncLogistics)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [orderId, syncLogistics]);

  if (loading || !deliveryPos) return (
    <div className="h-full w-full bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full w-full relative leaflet-dark-mode">
      <MapContainer 
        center={deliveryPos} 
        zoom={15} 
        zoomControl={false}
        className="h-full w-full bg-[#0a0a0a]"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        <MapRecenter center={deliveryPos} />

        {/* Path Polyline */}
        {userPos && (
          <Polyline 
            positions={[deliveryPos, userPos]} 
            pathOptions={{ color: '#ff4d94', weight: 4, opacity: 0.5, dashArray: '10, 10' }} 
          />
        )}

        {/* Rider Marker */}
        <Marker position={deliveryPos} icon={riderIcon} />

        {/* Destination Marker */}
        {userPos && (
          <Marker position={userPos}>
            <div className="w-4 h-4 bg-white border-2 border-primary rounded-full shadow-[0_0_10px_#ff4d94]"></div>
          </Marker>
        )}
      </MapContainer>

      {/* Custom Styles for Dark Mode Leaflet */}
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container { background: #0a0a0a !important; }
        .leaflet-tile-pane { filter: brightness(0.6) invert(1) contrast(3) hue-rotate(190deg) saturate(0.3); }
        .leaflet-grab { cursor: auto; }
      `}} />
    </div>
  );
}