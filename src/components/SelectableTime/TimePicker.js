"use client";

import React, { useState, useEffect, useRef } from "react";

const TimePicker = ({ isOpen, onClose, onSelect, initialValue = 900 }) => {
    // PM/AM + 1-12시 + 00/30분 구조로 변경
    const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
    const minutes = [0, 30];
    const periods = ["AM", "PM"];

    // initialValue를 24시간 형식에서 12시간 형식으로 변환
    const convertTo12Hour = (timeValue) => {
        const hour24 = Math.floor(timeValue / 100);
        const minute = timeValue % 100 === 30 ? 30 : 0;

        let hour12 = hour24;
        let period = "AM";

        if (hour24 === 0) {
            hour12 = 12;
            period = "AM";
        } else if (hour24 === 12) {
            hour12 = 12;
            period = "PM";
        } else if (hour24 > 12) {
            hour12 = hour24 - 12;
            period = "PM";
        } else {
            period = "AM";
        }

        return { hour12, minute, period };
    };

    // 12시간 형식을 24시간 형식으로 변환
    const convertTo24Hour = (hour12, minute, period) => {
        let hour24 = hour12;

        if (period === "AM") {
            if (hour12 === 12) hour24 = 0;
        } else {
            // PM
            if (hour12 !== 12) hour24 = hour12 + 12;
        }

        return hour24 * 100 + minute;
    };

    const initialTime = convertTo12Hour(initialValue);
    const [selectedHour, setSelectedHour] = useState(initialTime.hour12);
    const [selectedMinute, setSelectedMinute] = useState(initialTime.minute);
    const [selectedPeriod, setSelectedPeriod] = useState(initialTime.period);

    // 터치 상태 관리
    const [touchState, setTouchState] = useState({
        startY: null,
        startTime: null,
        moved: false,
    });

    const overlayRef = useRef(null);
    const hourScrollRef = useRef(null);
    const minuteScrollRef = useRef(null);
    const periodScrollRef = useRef(null);

    // 터치 시작 핸들러
    const handleTouchStart = (event) => {
        const touch = event.touches[0];
        setTouchState({
            startY: touch.clientY,
            startTime: Date.now(),
            moved: false,
        });
    };

    // 터치 무브 핸들러
    const handleTouchMove = (event) => {
        if (!touchState.startY) return;

        const touch = event.touches[0];
        const moveDistance = Math.abs(touch.clientY - touchState.startY);

        // 10px 이상 움직이면 스크롤로 간주
        if (moveDistance > 10) {
            setTouchState((prev) => ({ ...prev, moved: true }));
        }
    };

    // 터치 종료 핸들러 - 스크롤하지 않고 빠르게 터치한 경우에만 선택
    const handleTouchEnd = (value, setter, event) => {
        const touchDuration = Date.now() - (touchState.startTime || 0);

        // 스크롤하지 않고(moved: false) 빠른 터치(300ms 미만)인 경우에만 선택
        if (!touchState.moved && touchDuration < 300) {
            event.preventDefault();
            setter(value);
        }

        setTouchState({
            startY: null,
            startTime: null,
            moved: false,
        });
    };

    // 스크롤을 초기값 위치로 이동시키는 함수
    const scrollToInitialValues = () => {
        // DOM 요소를 직접 찾아서 즉시 스크롤
        if (hourScrollRef.current) {
            const selectedHourElement = hourScrollRef.current.querySelector(
                `[data-hour="${selectedHour}"]`
            );
            if (selectedHourElement) {
                selectedHourElement.scrollIntoView({
                    block: "start",
                    behavior: "auto",
                });
            }
        }

        if (minuteScrollRef.current) {
            const selectedMinuteElement = minuteScrollRef.current.querySelector(
                `[data-minute="${selectedMinute}"]`
            );
            if (selectedMinuteElement) {
                selectedMinuteElement.scrollIntoView({
                    block: "start",
                    behavior: "auto",
                });
            }
        }

        if (periodScrollRef.current) {
            const selectedPeriodElement = periodScrollRef.current.querySelector(
                `[data-period="${selectedPeriod}"]`
            );
            if (selectedPeriodElement) {
                selectedPeriodElement.scrollIntoView({
                    block: "start",
                    behavior: "auto",
                });
            }
        }
    };

    useEffect(() => {
        const time = convertTo12Hour(initialValue);
        setSelectedHour(time.hour12);
        setSelectedMinute(time.minute);
        setSelectedPeriod(time.period);
    }, [initialValue]);

    // TimePicker가 열릴 때만 초기 위치로 스크롤
    useEffect(() => {
        if (isOpen) {
            // 즉시 스크롤 실행
            scrollToInitialValues();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (
                overlayRef.current &&
                !overlayRef.current.contains(event.target)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    const handleSelect = () => {
        const timeValue = convertTo24Hour(
            selectedHour,
            selectedMinute,
            selectedPeriod
        );
        onSelect(timeValue);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={overlayRef} className="bg-white rounded-lg p-4 w-[300px]">
                <div className="flex justify-between mb-4">
                    {/* Hour Selection */}
                    <div className="w-1/3 pr-2">
                        <div
                            ref={hourScrollRef}
                            className="h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                            onTouchMove={handleTouchMove}
                        >
                            {hours.map((hour) => (
                                <div
                                    key={hour}
                                    data-hour={hour}
                                    className={`py-4 text-center cursor-pointer text-lg text-black ${
                                        selectedHour === hour
                                            ? "bg-[#3674B5]/20 text-[#3674B5]"
                                            : ""
                                    } hover:bg-[#3674B5]/10`}
                                    onClick={() => setSelectedHour(hour)}
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={(e) =>
                                        handleTouchEnd(hour, setSelectedHour, e)
                                    }
                                >
                                    {hour.toString().padStart(2, "0")}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Minute Selection */}
                    <div className="w-1/3 px-1">
                        <div
                            ref={minuteScrollRef}
                            className="h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                            onTouchMove={handleTouchMove}
                        >
                            {minutes.map((minute) => (
                                <div
                                    key={minute}
                                    data-minute={minute}
                                    className={`py-4 text-center cursor-pointer text-lg text-black ${
                                        selectedMinute === minute
                                            ? "bg-[#3674B5]/20 text-[#3674B5]"
                                            : ""
                                    } hover:bg-[#3674B5]/10`}
                                    onClick={() => setSelectedMinute(minute)}
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={(e) =>
                                        handleTouchEnd(
                                            minute,
                                            setSelectedMinute,
                                            e
                                        )
                                    }
                                >
                                    {minute.toString().padStart(2, "0")}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* AM/PM Selection */}
                    <div className="w-1/3 pl-2">
                        <div
                            ref={periodScrollRef}
                            className="h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                            onTouchMove={handleTouchMove}
                        >
                            {periods.map((period) => (
                                <div
                                    key={period}
                                    data-period={period}
                                    className={`py-4 text-center cursor-pointer text-lg text-black ${
                                        selectedPeriod === period
                                            ? "bg-[#3674B5]/20 text-[#3674B5]"
                                            : ""
                                    } hover:bg-[#3674B5]/10`}
                                    onClick={() => setSelectedPeriod(period)}
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={(e) =>
                                        handleTouchEnd(
                                            period,
                                            setSelectedPeriod,
                                            e
                                        )
                                    }
                                >
                                    {period}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSelect}
                        className="px-4 py-2 bg-[#3674B5] text-white rounded hover:bg-[#3674B5]/80"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimePicker;
