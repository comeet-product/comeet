"use client";

import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import Link from "next/link";

export default function Landing() {
    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-[375px] mx-auto relative">
                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="px-6 py-8 bg-gradient-to-br from-[#3674B5]/10 via-[#3674B5]/2 to-white"
                >
                    <div className="space-y-6">
                        <div className="text-center space-y-4">
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                                모두가 되는 시간,
                                <br />한 눈에 👀
                            </h1>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                함께 만나요, Co-meet
                            </p>
                        </div>

                        {/* 결과화면 */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.7,
                                ease: "easeOut",
                                delay: 0.1,
                            }}
                            className="bg-white rounded-xl shadow-sm border p-6 max-w-[280px] mx-auto"
                        >
                            <img
                                src="/resultpage.png"
                                alt="COMEET 결과화면"
                                className="w-full h-[400px] object-contain"
                            />
                        </motion.div>

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
                                        링크 공유만으로
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 3단계 섹션 */}
                <motion.section
                    id="steps-section"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                    className="px-6 py-12 pb-24 relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3674B5]/5 via-white to-[#3674B5]/10" />
                    <div className="space-y-12 relative z-10">
                        {/* Step 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#3674B5] to-[#3674B5]/90 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                                    1
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    미팅 생성
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                제목을 입력하고 약속 날짜와 시간대를 선택하세요
                            </p>

                            {/* Create Screen - 이미지로 대체 */}
                            <div className="text-center">
                                <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-4 shadow-sm max-w-[280px] mx-auto">
                                    <div className="flex items-center justify-center">
                                        <img
                                            src="/create.png"
                                            alt="Create 화면"
                                            className="w-full h-[400px] object-contain rounded-xl"
                                            style={{ margin: 0 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#3674B5] to-[#3674B5]/90 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                                    2
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    시간 선택
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                가능한 시간을 터치하거나 스르륵 드래그 하세요
                            </p>

                            {/* SelectTime Screen */}
                            <div className="text-center">
                                <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl px-2 py-0.5 shadow-sm max-w-[280px] mx-auto">
                                    <div className="flex items-center justify-center">
                                        <img
                                            src="/timeselect.png"
                                            alt="SelectTime 화면"
                                            className="w-full h-[400px] object-contain rounded-xl"
                                            style={{ margin: 0 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            id="last-step"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#3674B5] to-[#3674B5]/90 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                                    3
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    추천 시간
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                모두가 모이는 날부터, 오래 가능한 시간까지
                                확인하세요
                            </p>

                            {/* Share Screen */}
                            <div className="space-y-4">
                                <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl px-4 py-1 shadow-sm max-w-[280px] mx-auto">
                                    <div className="flex items-center justify-center">
                                        <img
                                            src="/cell.png"
                                            alt="추천 시간 화면"
                                            className="w-full h-[180px] object-contain rounded-xl"
                                            style={{ margin: 0 }}
                                        />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 text-center">
                                    셀을 누르면 가능한 사람들이 아래에 나타나요
                                </p>
                                <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl px-1 py-0.5 shadow-sm max-w-[280px] mx-auto my-0.5">
                                    <div className="flex items-center justify-center">
                                        <img
                                            src="/cell2.png"
                                            alt="추천 시간 화면2"
                                            className="w-full h-[260px] object-contain rounded-xl"
                                            style={{ margin: 0 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* 항상 보이는 Floating Button (페이지 진입 시만 애니메이션) */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
                    className="fixed left-0 right-0 bottom-6 z-50 pointer-events-none"
                >
                    <div className="max-w-[375px] mx-auto flex justify-center">
                        <Link
                            href="/create"
                            className="pointer-events-auto w-full flex justify-center"
                        >
                            <button className="bg-[#3674B5] hover:bg-[#3674B5]/90 text-white font-semibold rounded-full shadow-xl px-6 py-4 transition-colors text-base w-[80%] max-w-[260px] backdrop-blur-md">
                                시작하기
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Footer */}
                <footer className="bg-gray-50 py-6 px-6 pb-20">
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
            </div>
        </main>
    );
}
