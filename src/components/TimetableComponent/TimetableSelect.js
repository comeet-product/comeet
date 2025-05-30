'use client';

import React, { useState, useEffect, useRef } from 'react';
import TimetableComponent from "./TimetableComponent";
import { useSpring, animated } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';

const MIN_VISIBLE_DAYS = 1;
const MAX_VISIBLE_DAYS = 7; // Assuming a max of 7 days for a week view
const INITIAL_VISIBLE_DAYS = MAX_VISIBLE_DAYS;

export default function TimetableSelect() {
    const [visibleDayCount, setVisibleDayCount] = useState(INITIAL_VISIBLE_DAYS);
    const [totalDayCount, setTotalDayCount] = useState(MAX_VISIBLE_DAYS); // This could be dynamic later

    const target = useRef(null);

    // Props for TimetableComponent - these would ideally come from a higher-level state or props
    const timetableProps = {
        dayCount: totalDayCount, // Total days the timetable *can* show
        halfCount: 10, // Example value
        startDate: "05/20", // Example value
        startTime: 9, // Example value
        dateHeaderHeight: 23, // Example value
    };

    const [{ scale }, api] = useSpring(() => ({
        scale: 1,
        config: { tension: 300, friction: 30 },
    }));    

    useGesture(
        {
            onPinch: ({ offset: [s], memo, event }) => {
                event.preventDefault(); // Prevent browser default pinch zoom
                const newScale = s / 100; // Normalize scale factor (heuristic)
                api.start({ scale: newScale });

                // Determine new visibleDayCount based on scale
                // This logic might need refinement for better user experience
                let newVisibleDays;
                if (newScale > 1) { // Pinch out (zoom in)
                    newVisibleDays = Math.max(MIN_VISIBLE_DAYS, Math.floor(visibleDayCount / newScale));
                } else { // Pinch in (zoom out)
                    newVisibleDays = Math.min(totalDayCount, Math.ceil(visibleDayCount / newScale));
                }
                
                setVisibleDayCount(Math.max(MIN_VISIBLE_DAYS, Math.min(totalDayCount, newVisibleDays)));
                return memo;
            },
        },
        {
            target,
            eventOptions: { passive: false },
            pinch: { distanceBounds: { min: 0 } }
        }
    );

    return (
        <div ref={target} style={{ touchAction: 'none', width: '100%', overflow: 'hidden' }}>
            <animated.div style={{ scale, width: '100%' }}>
                <TimetableComponent
                    {...timetableProps}
                    visibleDayCount={visibleDayCount} 
                />
            </animated.div>
        </div>
    );
}