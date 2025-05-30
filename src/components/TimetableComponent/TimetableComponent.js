"use client"

import TimeHeader from "./TimeHeader";
import Timetable from "./Timetable";
import { useSpring, animated } from 'react-spring';

export default function TimetableComponent({ dayCount, halfCount, startDate, startTime, dateHeaderHeight, visibleDayCount }) {
  const timetableStyle = useSpring({
    width: `${(100 / dayCount) * visibleDayCount}%`, // Adjust width based on visibleDayCount
    config: { tension: 200, friction: 20 }
  });

  return (
    <div className="flex w-full overflow-hidden"> {/* Added overflow-hidden here */}
      {/* TimeHeader - 내용에 맞는 최소 너비, 줄어들지 않음 */}
      <div className="flex-shrink-0 min-w-max">
        <TimeHeader 
          halfCount={halfCount} 
          startTime={startTime}
          dateHeaderHeight={dateHeaderHeight}
        />
      </div>
      {/* Timetable - 남은 공간 모두 차지, 스크롤 가능하도록 */}
      <div className="flex-1 min-w-0 overflow-x-auto"> {/* Added overflow-x-auto here */}
        <animated.div style={timetableStyle} className="flex"> {/* Added animated.div and flex here */}
          <Timetable 
            dayCount={dayCount} 
            halfCount={halfCount} 
            startDate={startDate}
            // visibleDayCount will be used internally by Timetable if needed, or Timetable's rendering logic needs adjustment
          />
        </animated.div>
      </div>
    </div>
  );
} 