import Time from "./Time";

export default function TimeHeader({ halfCount, startTime, dateHeaderHeight }) {
  const hourCount = Math.floor(halfCount / 2);
  const hasExtraHalf = halfCount % 2 === 1;
  const halfHeight = 17;
  const hourHeight = halfHeight * 2; // 34px
  
  // Time 컴포넌트는 Hour 개수보다 1개 더 많아야 함
  const timeCount = hourCount + 1;
  
  // 시간 생성 함수
  const generateTimeLabels = (start, count) => {
    const times = [];
    for (let i = 0; i < count; i++) {
      const hour = start + i;
      const displayHour = hour > 12 ? hour - 12 : hour;
      const period = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = displayHour === 0 ? 12 : displayHour;
      times.push(`${formattedHour} ${period}`);
    }
    return times;
  };

  const timeLabels = generateTimeLabels(startTime, timeCount);

  return (
    <div className="relative flex justify-end" style={{ 
      width: 'fit-content',
      height: `${dateHeaderHeight + (halfCount * halfHeight)}px`
    }}>
      {/* DateHeader 높이만큼 빈 공간 */}
      <div style={{ height: `${dateHeaderHeight}px` }}></div>
      
      {/* Time 컴포넌트들 - Hour의 위아래 border line에 위치 */}
      {timeLabels.map((time, index) => {
        // 각 Time은 Hour의 경계선(위쪽 border)에 위치  
        const topPosition = dateHeaderHeight + (index * hourHeight);
        
        return (
          <div 
            key={`time-${index}`}
            className="absolute w-fit"
            style={{
              top: `${topPosition}px`,
              transform: 'translateY(-50%)', // Time을 border line 중앙에 위치
            }}
          >
            <Time time={time} />
          </div>
        );
      })}
    </div>
  );
}