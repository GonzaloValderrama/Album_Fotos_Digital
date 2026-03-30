import React from 'react';

const ImageProtector = ({ src, alt, className, style, onLoad, ref }) => {
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (e) => {
    e.preventDefault();
  };

  return (
    <div className={`protected-image-container ${className || ''}`} style={style}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={className}
        style={{ ...style, width: '100%', height: '100%', display: 'block' }}
        onLoad={onLoad}
        onDragStart={handleDragStart}
        onContextMenu={handleContextMenu}
        loading="lazy"
      />
      {/* Transparent overlay to catch clicks/drags */}
      <div 
        className="protected-image-overlay"
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
      />
    </div>
  );
};

export default ImageProtector;
