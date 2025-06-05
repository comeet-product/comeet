"use client";

import React, { useState, useEffect, useRef } from "react";

const TimePicker = ({ isOpen, onClose, onSelect, initialValue = 900 }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 30];

    const initialHour = Math.floor(initialValue / 100);
    const initialMinute = initialValue % 100 === 30 ? 30 : 0;

    const [selectedHour, setSelectedHour] = useState(initialHour);
    const [selectedMinute, setSelectedMinute] = useState(initialMinute);

    const overlayRef = useRef(null);

    useEffect(() => {
        setSelectedHour(Math.floor(initialValue / 100));
        setSelectedMinute(initialValue % 100 === 30 ? 30 : 0);
    }, [initialValue]);

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
        const timeValue = selectedHour * 100 + selectedMinute;
        onSelect(timeValue);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={overlayRef} className="bg-white rounded-lg p-4 w-[300px]">
                <div className="flex justify-between mb-4">
                    <div className="w-1/2 pr-2">
                        <div className="h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {hours.map((hour) => (
                                <div
                                    key={hour}
                                    className={`py-4 text-center cursor-pointer text-lg text-black ${
                                        selectedHour === hour
                                            ? "bg-blue-100"
                                            : ""
                                    } hover:bg-gray-100`}
                                    onClick={() => setSelectedHour(hour)}
                                >
                                    {hour.toString().padStart(2, "0")}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-1/2 pl-2">
                        <div className="h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {minutes.map((minute) => (
                                <div
                                    key={minute}
                                    className={`py-4 text-center cursor-pointer text-lg text-black${
                                        selectedMinute === minute
                                            ? "bg-blue-100"
                                            : ""
                                    } hover:bg-gray-100`}
                                    onClick={() => setSelectedMinute(minute)}
                                >
                                    {minute.toString().padStart(2, "0")}
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
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimePicker;
