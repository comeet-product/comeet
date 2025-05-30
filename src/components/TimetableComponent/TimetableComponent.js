"use client"

import TimeHeader from "./TimeHeader";
import Timetable from "./Timetable";
import { animated } from '@react-spring/web';

export default function TimetableComponent({ dayCount, halfCount, startDate, startTime, dateHeaderHeight, gestureBinder, animatedVisualScale }) {
  return (
    <div className="flex w-full">
      {/* TimeHeader - Fixed on the left */}
      <div className="flex-shrink-0 min-w-max">
        <TimeHeader 
          halfCount={halfCount} 
          startTime={startTime}
          dateHeaderHeight={dateHeaderHeight}
        />
      </div>
      {/* Gesture and animated container for Timetable (DateSelector area) - Takes remaining space */}
      <div 
        {...(gestureBinder ? gestureBinder() : {})}
        style={{ 
          touchAction: 'none',
          overflow: 'hidden',
        }}
        className="flex-1 min-w-0"
      >
        <animated.div
          style={{
            scale: animatedVisualScale,
            transformOrigin: 'left center',
            height: '100%',
            width: '100%',
          }}
          className="overflow-x-auto h-full"
        >
          <Timetable 
            dayCount={dayCount} 
            halfCount={halfCount} 
            startDate={startDate}
          />
        </animated.div>
      </div>
    </div>
  );
} 