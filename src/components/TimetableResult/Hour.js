import Half from "./Half";

export default function Hour({ isFirst = true }) {
  return (
    <div className="flex flex-col">
        <Half isTop={true} isFirstHour={isFirst} />
        <Half isTop={false} />
    </div>
  );
}