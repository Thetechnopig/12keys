import React, { useState, useCallback, Fragment } from 'react';
import { GoogleMap, useJsApiLoader, DrawingManager, Polygon, Marker, Circle } from '@react-google-maps/api';
import './App.css';

const containerStyle = {
  width: '100vw',
  height: '100vh'
};

const center = {
  lat: 39.8283,
  lng: -98.5795
};

const API_KEY = "YOUR_API_KEY_HERE"; // IMPORTANT: Replace with your actual API key
const LIBRARIES = ['drawing'];

const FEET_TO_METERS = 0.3048;

const SPRINKLER_TYPES = {
  rotor: { name: 'Rotor', radius: 30 }, // radius in feet
  spray: { name: 'Spray', radius: 15 },
};

const circleOptions = {
  strokeColor: '#0000FF',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#0000FF',
  fillOpacity: 0.35,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  zIndex: 1
};

function App() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY,
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState(null);
  const [path, setPath] = useState([]);
  const [drawingMode, setDrawingMode] = useState(true);
  const [sprinklers, setSprinklers] = useState([]);
  const [selectedSprinkler, setSelectedSprinkler] = useState(null);

  const onPolygonComplete = useCallback(polygon => {
    const newPath = polygon.getPath().getArray().map(latLng => ({ lat: latLng.lat(), lng: latLng.lng() }));
    setPath(newPath);
    setDrawingMode(false);
    polygon.setMap(null);
  }, []);

  const handleResetProperty = () => {
    setPath([]);
    setSprinklers([]);
    setSelectedSprinkler(null);
    setDrawingMode(true);
  };

  const handleClearSprinklers = () => {
    setSprinklers([]);
  };

  const handleDeleteSprinkler = (id) => {
    setSprinklers(current => current.filter(s => s.id !== id));
  };

  const handleMapClick = useCallback(event => {
    if (selectedSprinkler) {
      const newSprinkler = {
        type: selectedSprinkler,
        position: {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        },
        id: new Date().getTime(),
      };
      setSprinklers(current => [...current, newSprinkler]);
    }
  }, [selectedSprinkler]);

  const onLoad = useCallback(function callback(map) {
    map.setZoom(5);
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <div>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1, backgroundColor: 'white', padding: '10px', borderRadius: '5px', width: '280px', maxHeight: '95vh', overflowY: 'auto' }}>
        <h2>Lawn Sprinkler Design</h2>

        {!drawingMode && path.length > 0 ? (
          <div>
            <button onClick={handleResetProperty}>Redraw Property</button>
            <hr />
            <h3>Place Sprinklers</h3>
            <p>Select a type, then click on the map.</p>
            {Object.keys(SPRINKLER_TYPES).map(key => (
              <button
                key={key}
                onClick={() => setSelectedSprinkler(key)}
                style={{ backgroundColor: selectedSprinkler === key ? 'lightblue' : 'white', marginRight: '5px' }}
              >
                {SPRINKLER_TYPES[key].name}
              </button>
            ))}
            <button onClick={() => setSelectedSprinkler(null)} style={{marginTop: '5px'}}>Done</button>
            <hr />
            <h3>Placed Sprinklers ({sprinklers.length})</h3>
            <button onClick={handleClearSprinklers}>Clear All</button>
            <ul style={{ listStyleType: 'none', padding: 0, marginTop: '10px' }}>
              {sprinklers.map((s, index) => (
                <li key={s.id} style={{ marginBottom: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  #{index + 1}: {SPRINKLER_TYPES[s.type].name}
                  <button onClick={() => handleDeleteSprinkler(s.id)} style={{ float: 'right', cursor: 'pointer', border: 'none', background: 'transparent' }}>❌</button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>Click on the map to start drawing your property boundary.</p>
        )}
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
      >
        {drawingMode && (
          <DrawingManager
            onPolygonComplete={onPolygonComplete}
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: window.google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
              },
            }}
          />
        )}
        {path.length > 0 && <Polygon paths={path} options={{ fillColor: 'lightgreen', strokeColor: 'green' }} />}

        {sprinklers.map(sprinkler => (
          <Fragment key={sprinkler.id}>
            <Marker position={sprinkler.position} />
            <Circle
              center={sprinkler.position}
              radius={SPRINKLER_TYPES[sprinkler.type].radius * FEET_TO_METERS}
              options={circleOptions}
            />
          </Fragment>
        ))}

      </GoogleMap>
    </div>
  ) : <p>Loading map...</p>;
}

export default App;
