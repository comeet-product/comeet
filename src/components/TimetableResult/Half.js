export default function Half({ isTop }) {
  return (
    <div className={`w-full h-[17px] border-main ${
      isTop === undefined
        ? 'border-[1.3px]'
        : isTop 
          ? 'border-[1.3px] border-b-[1px] border-b-main/50' 
          : 'border-[1.3px] border-t-0'
    }`}>
    </div>
  );
} 