import DateCell from "./DateCell";

export default function DateHeader({ dayCount, selectedDates = null, pageStartDay = 0 }) {
  // 요일 배열 정의 (Calendar.js와 동일한 순서)
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // selectedDates가 없으면 빈 상태 반환
  if (!selectedDates || !Array.isArray(selectedDates)) {
    console.log('DateHeader: no selectedDates provided');
    return (
      <div className="flex">
        {Array.from({ length: dayCount }, (_, index) => (
          <div key={`empty-date-${index}`} className="flex-1">
            <DateCell 
              date="--/--"
              weekday="---"
              isFirstDay={index === 0}
            />
          </div>
        ))}
      </div>
    );
  }

  console.log('DateHeader using selectedDates:', { selectedDates, dayCount, pageStartDay });
  
  // 현재 페이지에서 표시할 날짜들 추출
  const pageDates = selectedDates.slice(pageStartDay, pageStartDay + dayCount);
  
  const dateInfos = pageDates.map((dateStr, index) => {
    const date = new Date(dateStr + 'T00:00:00'); // "2025-06-11" -> Date 객체
    
    // MM/DD 형식으로 포맷
    const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(date.getDate()).padStart(2, '0');
    const dateString = `${formattedMonth}/${formattedDay}`;
    
    // 요일 인덱스 가져오기 (0: 일요일, 1: 월요일, ...)
    const weekdayIndex = date.getDay();
    const weekday = weekdays[weekdayIndex];
    
    return {
      date: dateString,
      weekday: weekday,
      fullDate: date,
      originalDate: dateStr // 원본 날짜 문자열도 보관
    };
  });

  console.log('DateHeader generated dateInfos:', dateInfos);

  return (
    <div className="flex">
      {dateInfos.map((dateInfo, index) => (
        <div key={`date-${pageStartDay + index}`} className="flex-1">
          <DateCell 
            date={dateInfo.date}
            weekday={dateInfo.weekday}
            isFirstDay={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
