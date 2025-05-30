'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useGesture } from 'react-use-gesture';
import TimetableComponent from './TimetableComponent';

const MIN_DAYS = 1;
const MAX_DAYS = 7; // Assuming a maximum of 7 days
const INITIAL_DAYS = 5;

export default function TimetableSelect() {
  const [dayCount, setDayCount] = useState(INITIAL_DAYS);
  const dayCountRef = useRef(dayCount);

  useEffect(() => {
    dayCountRef.current = dayCount;
  }, [dayCount]);

  const [{ scale }, api] = useSpring(() => ({ scale: 1 }));

  const bind = useGesture({
    onPinch: ({ da: [distance], pinching, memo }) => {
      if (pinching) {
        api.start({ scale: distance / 200 }); // Adjust 200 based on sensitivity
        if (!memo) memo = dayCountRef.current;

        let newDayCount = memo;
        if (distance / 200 < 0.8) { // Zoom out
          newDayCount = Math.min(MAX_DAYS, memo + 1);
        } else if (distance / 200 > 1.2) { // Zoom in
          newDayCount = Math.max(MIN_DAYS, memo - 1);
        }
        
        if (newDayCount !== dayCountRef.current) {
            setDayCount(newDayCount);
        }
        return memo;
      } else {
        api.start({ scale: 1 });
        return dayCountRef.current; 
      }
    },
  });

  // Props for TimetableComponent - adjust as needed
  const timetableProps = {
    halfCount: 8, // Example value
    startDate: '05/19', // Example value
    startTime: 10, // Example value
    dateHeaderHeight: 23, // Example value
  };

  return (
    <animated.div {...bind()} style={{ touchAction: 'none', scale }}>
      <TimetableComponent {...timetableProps} dayCount={dayCount} />
    </animated.div>
  );
}