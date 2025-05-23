import Half from "./Half";

export default function Hour() {
  return (
    <div className="flex flex-col">
        <Half isTop={true} />
        <Half isTop={false} />
    </div>
  );
}