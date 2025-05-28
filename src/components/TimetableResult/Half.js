export default function Half({ isTop, isFirstHour, hasHourAbove, isFirstDay, hasDateHeaderAbove }) {
  return (
    <div className={`w-full h-[17px] border-main ${
      isTop === undefined
        ? `border-[1.3px] ${hasHourAbove ? 'border-t-0' : ''} ${!isFirstDay ? 'border-l-0' : ''} ${hasDateHeaderAbove ? 'border-t-0' : ''}`
        : isTop 
          ? `border-[1.3px] border-b-[1px] border-b-main/50 ${!isFirstHour ? 'border-t-0' : ''} ${!isFirstDay ? 'border-l-0' : ''} ${hasDateHeaderAbove ? 'border-t-0' : ''}` 
          : `border-[1.3px] border-t-0 ${!isFirstDay ? 'border-l-0' : ''}`
    }`}>
    </div>
  );
} 