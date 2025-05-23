import Half from "./Half";

export default function Hour({ isFirst = true, isFirstDay = true }) {
  return (
    <div className="flex flex-col">
        <Half isTop={true} isFirstHour={isFirst} isFirstDay={isFirstDay} />
        <Half isTop={false} isFirstDay={isFirstDay} />
    </div>
  );
}