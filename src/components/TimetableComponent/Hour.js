import Half from "./Half";

export default function Hour({ isFirst, isFirstDay, hasDateHeaderAbove }) {
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