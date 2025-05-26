"use client";
import { runTestFlow } from "@/lib/test/runTestFlow";

export default function Page() {
    return <button onClick={runTestFlow}>테스트 실행</button>;
}
