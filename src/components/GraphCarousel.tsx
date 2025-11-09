'use client';

import React from 'react';
import Slider from 'react-slick';
import Graph from './Graph';

// Sample graph data
const sampleData1 = [5.6, 6.1, 6.8, 7.0, 6.3, 6.7, 6.2, 5.9, 6.5, 7.1]; // pH levels
const sampleData2 = [12, 14, 18, 22, 25, 28, 32, 30, 33, 31]; // Temperature (°C)
const sampleData3 = [10, 15, 12, 20, 18, 22, 25, 21, 23, 30]; // Nitrogen (ppm)

export default function GraphCarousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  return (
    // 👇 Center the carousel in its parent container
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-full max-w-2xl">
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
    </div>
  );
}
