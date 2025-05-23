export default function Half({ isTop }) {
  return (
    <div className={`w-full h-[17px] border-main ${
      isTop 
        ? 'border border-b-[0.3px]' 
        : 'border border-t-[0.3px]'
    }`}>
    </div>
  );
} 