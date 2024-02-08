import React, { useState, useRef, useEffect } from 'react';
import { ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable';
import './App.css';
import DraggableResizableText from './DraggableResizableText';

function App() {
  const [overlays, setOverlays] = useState([]);
  const [overlayType, setOverlayType] = useState('text');
  const [overlayText, setOverlayText] = useState('');
  const [overlayLogo, setOverlayLogo] = useState(null);
  const [parentDimensions, setParentDimensions] = useState({ width: 0, height: 0 });
  const [selectedOverlay, setSelectedOverlay] = useState(null);

  useEffect(() => {
    const parentRect = document.querySelector('.relative').getBoundingClientRect();
    setParentDimensions({ width: parentRect.width, height: parentRect.height });
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/overlays')
      .then(response => response.json())
      .then(data => {
        setOverlays(data);
      });
  },[])

  const addOverlay = () => {
    const newOverlay = {
      id: Math.random().toString(36).substring(7),
      type: overlayType,
      content: overlayType === 'text' ? overlayText : overlayLogo,
      x:0,
      y: 0,
      width: 100,
      height: 100,
    };
    fetch('http://localhost:5000/overlay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newOverlay),
    }).then(response => response.json())
      .then(data => {
        setOverlays([...overlays, data]);
      });
  };

  const handleTextChange = (e) => {
    setOverlayText(e.target.value);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result; 
      setOverlayLogo(imageUrl); 
    };
    reader.readAsDataURL(file);
  };
  
  const handleOverlayClick = (id) => {
    setSelectedOverlay(id);
  };

  const handleRemoveOverlay = () => {
    console.log(selectedOverlay);
    if (!selectedOverlay) return; // No selected overlay to remove
    const updatedOverlays = overlays.filter(overlay => overlay.id !== selectedOverlay);
    fetch(`http://localhost:5000/overlay/${selectedOverlay}`, {
      method: 'DELETE',
    });
    setOverlays(updatedOverlays);
    setSelectedOverlay(null); // Reset selected overlay after removal
  };

  const renderOverlays = () => {
    return overlays?.map((overlay, index) => (
      <DraggableResizableText 
        content={overlay.content} 
        key={overlay.id} 
        id={overlay.id}
        _id={overlay._id}
        type={overlay.type}
        setOverlays={setOverlays}
        selected={selectedOverlay === overlay._id}
        setSelectedOverlay={setSelectedOverlay}
        x={overlay.x}
        y={overlay.y}
      />
    ));
  };

  const videoRef = useRef(null);

  const playVideo = () => {
    videoRef.current.play();
  };

  const pauseVideo = () => {
    videoRef.current.pause();
  };

  const handleVolumeChange = (e) => {
    videoRef.current.volume = e.target.value;
  };

  const handleSave = () => {
    overlays.forEach(overlay => {
      fetch(`http://localhost:5000/overlay/${overlay._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(overlay),
      });
    }
    );
  };

  return (
    <div className="App">
      <h1>Video with Overlays</h1>
      <div className="relative">
        <video ref={videoRef} className='w-[70vw] h-auto' controls>
          <source src="http://localhost:5000/video" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {renderOverlays()}
      </div>
      <div>
        <button onClick={playVideo}>Play</button>
        <button onClick={pauseVideo}>Pause</button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          defaultValue="0.5" // Default volume
          onChange={handleVolumeChange}
        />
      </div>
      <div>
        <label>
          <input type="radio" value="text" checked={overlayType === 'text'} onChange={() => setOverlayType('text')} />
          Text Overlay:
          <input type="text" value={overlayText} onChange={handleTextChange} />
        </label>
      </div>
      <div>
        <label>
          <input type="radio" value="logo" checked={overlayType === 'logo'} onChange={() => setOverlayType('logo')} />
          Logo Overlay:
          <input type="file" onChange={handleLogoChange} accept="image/*" />
        </label>
      </div>
      <button onClick={addOverlay}>Add Overlay</button>
      <button onClick={handleRemoveOverlay}>Remove Overlay</button>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

export default App;
