import Hour from "./Hour";
import Half from "./Half";

export default function Day({ halfCount, isFirstDay = true }) {
  const hourCount = Math.floor(halfCount / 2);
  const hasExtraHalf = halfCount % 2 === 1;

  return (
    <div className="flex flex-col">
      {/* Hour 컴포넌트들 */}
      {Array.from({ length: hourCount }, (_, index) => (
        <Hour 
          key={`hour-${index}`}
          isFirst={index === 0}
          isFirstDay={isFirstDay}
        />
      ))}
      
      {/* 홀수개일 때 마지막 Half */}
      {hasExtraHalf && (
        <Half 
          hasHourAbove={hourCount > 0} 
          isFirstDay={isFirstDay}
        />
      )}
    </div>
  );
}