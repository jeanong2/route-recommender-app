import React from "react";
import video from '../static/video2.mp4'
import '../styles/VideoComponent.css'
import '../App.css'

function VideoComponent() {
  return (
    <div className='video-container'>
      <video src={video} autoPlay loop muted  />
      <h1>ADVENTURE AWAITS</h1>
      <p>Find a scenic route today!</p>
    </div>
  );
}
export default VideoComponent;
