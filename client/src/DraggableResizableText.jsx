import React, { useState, useEffect } from "react";
import Draggable from "react-draggable";
import { EditText } from "react-edit-text";
import textFit from "textfit";
import "react-edit-text/dist/index.css";
import "./DraggableResizableText.css";

const DraggableResizableText = (props) => {
  const [position, setPosition] = useState({ x: props.x, y: props.y });
  const [size, setSize] = useState({ width: 200, height: 100 });
  const [content, setContent] = useState(props.content || "");
  const [selected, setSelected] = useState(false); // Added selected state

  const handleDrag = (e, ui) => {
    const { x, y } = ui;
    const parentRect = e.target.parentElement.getBoundingClientRect();
    const newX = Math.min(Math.max(x, 0), parentRect.width - size.width);
    const newY = Math.min(Math.max(y, 0), parentRect.height - size.height);
    
    setPosition({ x: newX, y: newY });
  
    const overlay = {
      id: props.id,
      x: newX,
      y: newY,
      width: size.width,
      height: size.height,
        content: content,
        type: props.type,
      _id: props._id,
    };
  
    console.log('Overlay:', overlay);
    console.log('Current props id:', props.id);
  
    props.setOverlays((prevOverlays) => {
      console.log('Previous overlays:', prevOverlays);
  
      const newOverlays = prevOverlays.map((o) =>
        o.id === props.id ? overlay : o
      );
  
      console.log('New overlays:', newOverlays);
  
      return newOverlays;
    });
  };
  

  const handleTextChange = (value) => {
    setContent(value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // Handle image upload or processing here
  };

  const handleSelect = () => {
    if (!props.selected) {
        props.setSelectedOverlay(props._id);
      }
    else {
        props.setSelectedOverlay(null);
      }
  };
  const handleBlur = () => {
    props.setSelectedOverlay(null);
  };

  return (
    <Draggable
      handle=".handle"
      defaultPosition={{ x: 0, y: 0 }}
      position={null}
      grid={[1, 1]}
      scale={1}
      onDrag={handleDrag}
      bounds="parent"
    >
      <div
        className={`handle draggable-resizable-content top-0 absolute ${
          selected ? "selected" : ""
        }`}
      >
        {props.type === "text" ? (
          <EditText
            defaultValue={content}
            onChange={handleTextChange}
            className="w-fit"
            style={{ width: "fit-content" }}
            id="content"
            onEditMode={handleSelect}
            onBlur={handleSelect}
          />
        ) : (
          <img
            src={content} // Assuming content is the URL of the image
            alt="Overlay Image"
            className="w-32 h-32"
            onClick={handleSelect}
          />
        )}
      </div>
    </Draggable>
  );
};

export default DraggableResizableText;
