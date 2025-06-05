export default function DateCell({ date, weekday, isFirstDay }) {
  return (
    <div className={`w-full h-[23px] border-none bg-white flex flex-col items-center justify-center ${
      `border-[1.3px] border-b-0 ${!isFirstDay ? 'border-l-0' : ''}`
    }`}>
      <span className="text-black font-medium text-[8px] leading-none">
        {weekday}
      </span>
      <span className="h-[2px]"></span>
      <span className="text-black font-semibold text-[10px] leading-none">
        {date}
      </span>
    </div>
  );
}
