export default function Date({ date, isFirstDay }) {
  return (
    <div className={`w-full h-[23px] border-main bg-main/20 flex items-center justify-center ${
      `border-[1.3px] ${!isFirstDay ? 'border-l-0' : ''}`
    }`}>
      <span className="text-black text-[10px] font-normal ">
        {date}
      </span>
    </div>
  );
}
