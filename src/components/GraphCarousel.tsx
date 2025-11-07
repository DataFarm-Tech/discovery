'use client';

import React from 'react';
import Slider from 'react-slick';  // React Slick import
import Graph from './Graph'; // Graph component for displaying charts

const sampleData1 = [5.6, 6.1, 6.8, 7.0, 6.3, 6.7, 6.2, 5.9, 6.5, 7.1]; // pH levels over time
const sampleData2 = [12, 14, 18, 22, 25, 28, 32, 30, 33, 31];         // Temperature trend (°C)
const sampleData3 = [10, 15, 12, 20, 18, 22, 25, 21, 23, 30];        // Nitrogen levels (ppm)

export default function GraphCarousel() {
  const settings = {
    dots: true,          // Display the dots for navigation
    infinite: true,      // Infinite scrolling
    speed: 500,          // Slide transition speed
    slidesToShow: 1,     // Number of slides to show at once
    slidesToScroll: 1,   // Number of slides to scroll at once
    arrows: false,       // Disable the arrows on either side of the carousel
    autoplay: true,      // Enable auto-rotation
    autoplaySpeed: 2000, // Duration between each slide transition (5 seconds)
  };

  return (
    <div className="w-full mt-6">
      <Slider {...settings}>
        <div className="flex justify-center items-center">
          <Graph title="Average pH over Time" data={sampleData1} />
        </div>
        <div className="flex justify-center items-center">
          <Graph title="Temperature Trend (°C)" data={sampleData2} />
        </div>
        <div className="flex justify-center items-center">
          <Graph title="Nitrogen Levels (ppm)" data={sampleData3} />
        </div>
      </Slider>
    </div>
  );
}
