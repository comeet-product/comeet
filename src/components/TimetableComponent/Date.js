export default function Date({ date, isFirstDay }) {
  return (
    <div className={`w-full h-[23px] border-none bg-white flex items-center justify-center ${
      `border-[1.3px] border-b-0 ${!isFirstDay ? 'border-l-0' : ''}`
    }`}>
      <span className="text-black font-semibold text-[10px] ">
        {date}
      </span>
    </div>
  );
}
