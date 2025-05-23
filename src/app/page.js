import Title from "@/components/Title";
import Half from "@/components/TimetableResult/Half";
import Hour from "@/components/TimetableResult/Hour";

export default function Home() {
  return (
    <div className="p-4 md:p-6">
      <Title>안녕하세요! 메인 제목입니다</Title>
      <br />
      <Half />
      <br />
      <Hour />
    </div>
  );
}