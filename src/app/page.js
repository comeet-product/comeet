"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function Landing() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen bg-white max-w-[375px] mx-auto">
            {/* 상단 그라데이션 배경 */}
            <div
                className="absolute top-0 left-0 w-full h-screen z-0"
                style={{
                    background:
                        "linear-gradient(to bottom, rgba(54, 116, 181, 0.15) 0%, rgba(54, 116, 181, 0.1) 30%, rgba(54, 116, 181, 0.05) 70%, rgba(54, 116, 181, 0.02) 100%)",
                }}
            />

            {/* Hero Section */}
            <section className="px-6 py-8 relative z-10">
                <div className="space-y-6">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                            모두가 되는 시간,
                            <br />
                            한눈에
                        </h1>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            번거로운 일정 조율,
                            <br />
                            추천 시간까지 COMEET으로 한눈에 확인 👀
                        </p>
                    </div>

                    {/* 결과화면 Placeholder */}
                    <div className="bg-white/90 rounded-xl shadow-lg border p-6 backdrop-blur-sm">
                        <div className="relative h-56 bg-gray-50 rounded-lg overflow-hidden">
                            <div className="absolute inset-0">
                                <img
                                    src="/resultpage.png"
                                    alt="COMEET 결과화면"
                                    className="w-full object-cover object-top"
                                />
                                <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-white via-white/80 to-transparent" />
                            </div>
                        </div>
                    </div>

                    {/* 장점 */}
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-[#3674B5]" />
                                <span className="text-gray-600">
                                    회원가입 없이
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-[#3674B5]" />
                                <span className="text-gray-600">
                                    빠르게 공유해서
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-[#3674B5]" />
                                <span className="text-sm text-gray-600">
                                    즉시 결과 확인!
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3단계 섹션 */}
            <section className="px-6 py-8 pb-24 relative z-10">
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                            3단계로 완성하는 미팅 일정
                        </h2>
                    </div>

                    <div className="bg-white/90 rounded-xl shadow-lg p-6 backdrop-blur-sm space-y-6">
                        {/* 1단계 */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-[#3674B5] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    1
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    미팅 생성
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 ml-8">
                                제목을 입력하고 날짜와 시간대를 선택해요
                            </p>
                        </div>

                        {/* 2단계 */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-[#3674B5] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    2
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    시간 선택
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 ml-8">
                                가능한 시간을 톡 누르거나 <br />
                                스르륵 드래그 하세요
                            </p>
                        </div>

                        {/* 3단계 */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-[#3674B5] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    3
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    링크 공유
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 ml-8">
                                참석자들에게 링크를 바로 공유해보세요
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="px-6 py-4 relative z-10">
                <div className="text-center">
                    <h2 className="text-2xl font-medium text-gray-900 leading-tight">
                        지금 바로 간편하고 빠르게
                        <br />
                        약속 시간을 정해보세요!
                    </h2>
                </div>
            </section>

            {/* Feedback Section */}
            <section className="px-6 py-6 bg-gray-100 text-center relative z-10">
                <h2 className="text-base font-medium text-gray-900 mb-3">
                    서비스 개선을 위한 의견을 보내주세요
                </h2>
                <button
                    className="bg-[#3674B5]/20 hover:bg-[#3674B5]/30 text-[#3674B5] font-medium rounded-lg px-5 py-2 text-sm transition-colors"
                    onClick={() =>
                        window.open("https://tally.so/r/mZLO9A", "_blank")
                    }
                >
                    의견 보내기
                </button>
            </section>

            {/* Simple Footer */}
            <footer className="bg-gray-50 py-6 px-6 pb-32 relative z-10">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <img
                            src="/logo_text.png"
                            alt="COMEET Logo"
                            className="h-6 w-auto"
                        />
                    </div>
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} COMEET. All rights
                        reserved.
                    </p>
                </div>
            </footer>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white p-4">
                <div className="max-w-[375px] mx-auto border-t border-gray-200 pt-4">
                    <div className="flex justify-center">
                        <Link href="/create">
                            <button
                                className="bg-[#3674B5] hover:bg-[#3674B5]/90 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                                style={{ width: "313px", height: "59px" }}
                            >
                                시작하기
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
