'use client';

import React, { useState, useRef } from 'react';
import { useSpring } from '@react-spring/web'; // animated is used in TimetableComponent
import { useGesture } from 'react-use-gesture';
import TimetableComponent from './TimetableComponent';

const MIN_DAYS = 1;
const MAX_DAYS = 7; // Max 7 days visible
const INITIAL_DAYS = 5;
const PINCH_OUT_THRESHOLD = 1.2; // Scale factor to decrease dayCount (zoom in)
const PINCH_IN_THRESHOLD = 0.8;  // Scale factor to increase dayCount (zoom out)

export default function TimetableSelect() {
  const [dayCount, setDayCount] = useState(INITIAL_DAYS);
  const dayCountAtPinchStart = useRef(INITIAL_DAYS);

  const [{ visualScale }, api] = useSpring(() => ({
    visualScale: 1,
    config: { tension: 280, friction: 30 },
  }));

  const bind = useGesture(
    {
      onPinchStart: (state) => {
        state.event?.preventDefault();
        dayCountAtPinchStart.current = dayCount;
        // Setting initial scale for the spring based on current gesture state if needed,
        // or ensure `from` in config handles it well.
        api.start({ visualScale: state.offset[0], immediate: true });
      },
      onPinch: (state) => {
        state.event?.preventDefault();
        const [s] = state.offset; // s is the scaling factor from the start of the gesture
        api.start({ visualScale: s });
      },
      onPinchEnd: (state) => {
        state.event?.preventDefault();
        const [s] = state.offset; // Final scale factor for this pinch gesture

        let finalDayCount = dayCountAtPinchStart.current;
        if (s > PINCH_OUT_THRESHOLD && dayCountAtPinchStart.current > MIN_DAYS) {
          finalDayCount = Math.max(MIN_DAYS, dayCountAtPinchStart.current - 1);
        } else if (s < PINCH_IN_THRESHOLD && dayCountAtPinchStart.current < MAX_DAYS) {
          finalDayCount = Math.min(MAX_DAYS, dayCountAtPinchStart.current + 1);
        }
        
        setDayCount(finalDayCount);
        api.start({ visualScale: 1 }); // Reset visual scale smoothly
      },
      onDrag: ({ pinching, event }) => {
        if (pinching) { // Prevent page scroll only when pinching as part of the same gesture
          event?.preventDefault();
        }
      },
    },
    {
      eventOptions: { passive: false, capture: true }, // Crucial for preventDefault()
      pinch: {
        from: () => [visualScale.get(), 0], // Ensures smooth scale transition if gesture is interrupted
        scaleBounds: { min: 0.5, max: 2.5 }, // Bounds for the scaling factor `s` from `offset`
        rubberband: true,
      },
    }
  );

  // Example props for TimetableComponent, adjust as needed
  const timetableProps = {
    halfCount: 8,
    startDate: '05/19',
    startTime: 10,
    dateHeaderHeight: 23,
  };

  return (
    <div> {/* This outer div does not get scaled or directly receive gestures */}
      <TimetableComponent
        {...timetableProps}
        dayCount={dayCount}
        gestureBinder={bind} // Pass the bind function for gesture handling
        animatedVisualScale={visualScale} // Pass the spring's animated value for scaling effect
      />
    </div>
  );
}