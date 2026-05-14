import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
  marginTop: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
};

const center = {
  lat: 7.8731, // Sri Lanka center
  lng: 80.7718
};

export default function LocationPicker({ onLocationSelect, initialAddress }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [map, setMap] = useState(null);
  const [markerPos, setMarkerPos] = useState(center);
  const [address, setAddress] = useState(initialAddress || '');
  const autocompleteRef = useRef(null);

  // Update address when marker moves (Reverse Geocoding)
  const updateAddressFromCoords = useCallback((lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const formattedAddress = results[0].formatted_address;
        setAddress(formattedAddress);
        onLocationSelect(formattedAddress, { lat, lng });
      }
    });
  }, [onLocationSelect]);

  const onMapClick = useCallback((e) => {
    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarkerPos(newPos);
    updateAddressFromCoords(newPos.lat, newPos.lng);
  }, [updateAddressFromCoords]);

  const onPlaceSelected = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const newPos = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      setMarkerPos(newPos);
      setAddress(place.formatted_address);
      onLocationSelect(place.formatted_address, newPos);
      map.panTo(newPos);
      map.setZoom(15);
    }
  };

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="location-picker-container">
      <Autocomplete
        onLoad={(ref) => (autocompleteRef.current = ref)}
        onPlaceChanged={onPlaceSelected}
        options={{
          componentRestrictions: { country: 'lk' }
        }}
      >
        <input
          type="text"
          placeholder="Search for a location in Sri Lanka..."
          className="form-input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </Autocomplete>
      
      <div className="map-wrapper">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={markerPos}
          zoom={8}
          onLoad={onLoad}
          onClick={onMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            restriction: {
              latLngBounds: {
                north: 9.9,
                south: 5.8,
                east: 82.0,
                west: 79.3,
              },
              strictBounds: false
            },
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          }}
        >
          <Marker 
            position={markerPos} 
            draggable={true}
            onDragEnd={(e) => {
              const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
              setMarkerPos(newPos);
              updateAddressFromCoords(newPos.lat, newPos.lng);
            }}
          />
        </GoogleMap>
      </div>
      <small>
        📍 Tip: You can drag the marker or click anywhere on the map to set the exact location.
      </small>
    </div>
  );
}
