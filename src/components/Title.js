export default function Title({ children }) {
  return (
    <div className="flex justify-center items-center">
      <h1 className="text-2xl font-bold text-black">{children}</h1>
      <img src="/link-icon.svg" alt="link-icon" className="ml-2 flex-shrink-0" />
    </div>
  );
}