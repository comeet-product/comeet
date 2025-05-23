import Half from "./Half";

export default function Hour({ isFirst = true, isFirstDay = true, hasDateHeaderAbove = false }) {
  return (
    <div className="flex flex-col">
        <Half 
          isTop={true} 
          isFirstHour={isFirst} 
          isFirstDay={isFirstDay} 
          hasDateHeaderAbove={hasDateHeaderAbove}
        />
        <Half isTop={false} isFirstDay={isFirstDay} />
    </div>
  );
}