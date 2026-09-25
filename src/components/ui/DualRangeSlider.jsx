'use client';
import React, { useState, useEffect, useRef } from 'react';

const DualRangeSlider = ({ min = 0, max = 10000, step = 100, value, onChange }) => {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);

  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  const getPercent = (v) => Math.round(((v - min) / (max - min)) * 100);

  const handleMinChange = (e) => {
    const v = Math.min(Number(e.target.value), maxVal - step);
    setMinVal(v);
    minValRef.current = v;
    onChange([v, maxVal]);
  };

  const handleMaxChange = (e) => {
    const v = Math.max(Number(e.target.value), minVal + step);
    setMaxVal(v);
    maxValRef.current = v;
    onChange([minVal, v]);
  };

  return (
    <div className="relative w-full h-6 flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMinChange}
        className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none z-20"
        style={{
          WebkitAppearance: 'none',
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMaxChange}
        className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none z-30"
        style={{
          WebkitAppearance: 'none',
        }}
      />
      
      {/* Custom Track */}
      <div className="absolute w-full h-1.5 bg-neutral-200 rounded-full z-10" />
      <div 
        className="absolute h-1.5 bg-black rounded-full z-10" 
        style={{ 
          left: `${getPercent(minVal)}%`, 
          width: `${getPercent(maxVal) - getPercent(minVal)}%` 
        }} 
      />

      {/* Custom Thumbs (Visual Only) */}
      <div 
        className="absolute w-5 h-5 bg-white border-2 border-black rounded-full shadow-md z-40 transform -translate-x-1/2 pointer-events-none"
        style={{ left: `${getPercent(minVal)}%` }}
      />
      <div 
        className="absolute w-5 h-5 bg-white border-2 border-black rounded-full shadow-md z-40 transform -translate-x-1/2 pointer-events-none"
        style={{ left: `${getPercent(maxVal)}%` }}
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        input[type=range]::-webkit-slider-thumb {
          pointer-events: all;
          width: 20px;
          height: 20px;
          -webkit-appearance: none;
          border-radius: 50%;
          opacity: 0;
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          pointer-events: all;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          opacity: 0;
          cursor: pointer;
          border: none;
        }
      `}} />
    </div>
  );
};

export default DualRangeSlider;
