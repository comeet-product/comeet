import Date from "./Date";

export default function DateHeader({ dayCount, startDate, visibleDayCount }) {
  // 시작 날짜를 기준으로 연속된 날짜들을 생성, 이 로직은 나중에 유저 인풋값 받는 방식으로 수정해야 함
  const generateDates = (start, count) => {
    const dates = [];
    const [month, day] = start.split('/').map(Number);
    
    for (let i = 0; i < count; i++) {
      const currentDay = day + i;
      const formattedMonth = month.toString().padStart(2, '0');
      const formattedDay = currentDay.toString().padStart(2, '0');
      dates.push(`${formattedMonth}/${formattedDay}`);
    }
    
    return dates;
  };

  // Generate all dates based on dayCount, but map only visibleDayCount
  const allDates = generateDates(startDate, dayCount);
  const visibleDates = allDates.slice(0, visibleDayCount);

  return (
    <div className="flex">
      {visibleDates.map((date, index) => (
        <div key={`date-${index}`} className="flex-1" style={{ minWidth: `${100 / visibleDayCount}%` }}> {/* Adjust minWidth based on visibleDayCount*/}
          <Date 
            date={date}
            isFirstDay={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
