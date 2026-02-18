import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '100%' };

// Dark Mode Styles for the "Kilogram" theme
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#303030" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
];

export default function LiveTrackingMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY" // Replace with your actual key
  });

  const [deliveryPos, setDeliveryPos] = useState({ lat: 19.0760, lng: 72.8777 });
  const [userPos] = useState({ lat: 19.0850, lng: 72.8900 });
  const [directions, setDirections] = useState(null);

  // Simulate movement toward user
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveryPos(prev => ({
        lat: prev.lat + 0.0001,
        lng: prev.lng + 0.0001
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchRoute = useCallback(() => {
    if (!window.google) return;
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: deliveryPos,
        destination: userPos,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") setDirections(result);
      }
    );
  }, [deliveryPos, userPos]);

  useEffect(() => {
    if (isLoaded) fetchRoute();
  }, [isLoaded, fetchRoute]);

  if (!isLoaded) return <div className="h-full w-full bg-[#151515] animate-pulse" />;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={deliveryPos}
      zoom={15}
      options={{ styles: darkMapStyle, disableDefaultUI: true }}
    >
      {directions && (
        <DirectionsRenderer 
          directions={directions} 
          options={{
            polylineOptions: { strokeColor: "#ff007a", strokeWeight: 5 },
            preserveViewport: true,
            suppressMarkers: true 
          }} 
        />
      )}
      <Marker position={deliveryPos} icon={{ url: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png", scaledSize: new window.google.maps.Size(40, 40) }} />
      <Marker position={userPos} />
    </GoogleMap>
  );
}