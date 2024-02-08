import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'; // Import Video.js CSS

const VideoPlayer = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Initialize Video.js player
    const player = videojs(videoRef.current, {
      autoplay: true,
      controls: true,
      preload: 'auto',
      fluid: true
    });

    // Load HLS stream
    player.src({
      src: '/hls.m3u8', // Replace with your HLS stream URL
      type: 'application/x-mpegURL'
    });

    return () => {
      // Dispose the player on component unmount
      if (player) {
        player.dispose();
      }
    };
  }, []);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-default-skin" />
    </div>
  );
};

export default VideoPlayer;
