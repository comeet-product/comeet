import DateCell from "./DateCell";

export default function DateHeader({ dayCount, startDate }) {
  // 요일 배열 정의 (Calendar.js와 동일한 순서)
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // startDate를 기준으로 연속된 날짜와 요일 정보를 생성
  const generateDatesWithWeekdays = (start, count) => {
    const dates = [];
    
    // startDate가 'MM/DD' 형식이라고 가정하고 현재 연도를 사용
    const currentYear = new Date().getFullYear();
    const [month, day] = start.split('/').map(Number);
    
    // 시작 날짜 객체 생성
    const startDateObj = new Date(currentYear, month - 1, day); // month는 0-based
    
    for (let i = 0; i < count; i++) {
      // 각 날짜 객체 생성
      const currentDateObj = new Date(startDateObj);
      currentDateObj.setDate(startDateObj.getDate() + i);
      
      // 월/일 형식으로 포맷
      const formattedMonth = (currentDateObj.getMonth() + 1).toString().padStart(2, '0');
      const formattedDay = currentDateObj.getDate().toString().padStart(2, '0');
      const dateString = `${formattedMonth}/${formattedDay}`;
      
      // 요일 인덱스 가져오기 (0: 일요일, 1: 월요일, ...)
      const weekdayIndex = currentDateObj.getDay();
      const weekday = weekdays[weekdayIndex];
      
      dates.push({
        date: dateString,
        weekday: weekday,
        fullDate: currentDateObj
      });
    }
    
    return dates;
  };

  const dateInfos = generateDatesWithWeekdays(startDate, dayCount);

  return (
    <div className="flex">
      {dateInfos.map((dateInfo, index) => (
        <div key={`date-${index}`} className="flex-1">
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
