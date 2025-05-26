import Title from "@/components/Title";
import Half from "@/components/TimetableResult/Half";
import Hour from "@/components/TimetableResult/Hour";
import Day from "@/components/TimetableResult/Day";
import Button from "@/components/Button";

export default function Home() {
    return (
        <div className="p-4 md:p-6">
            <Title>Comeet 회의</Title>
            <br />

            <Title>Timetable Components Test</Title>
            <br />

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm text-gray-500 mb-2">Single Half</h3>
                    <Half />
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        Hour (2 Halves)
                    </h3>
                    <Hour />
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        Day with 3 Halves (1 Hour + 1 Half)
                    </h3>
                    <Day halfCount={3} />
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        Day with 4 Halves (2 Hours)
                    </h3>
                    <Day halfCount={4} />
                </div>

                <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                        Day with 5 Halves (2 Hours + 1 Half)
                    </h3>
                    <Day halfCount={5} />
                </div>

                <Title>Button Components Test</Title>
                <div className="space-y-4 mb-8">
                    <div className="mx-auto">
                        <Button size="large" text="미팅 생성" />
                    </div>
                    <div className="mx-auto">
                        <Button size="small" text="미팅 생성" />
                    </div>
                </div>
            </div>
        </div>
    );
}
