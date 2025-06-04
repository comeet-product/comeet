"use client";

import React, { useState } from "react";

const Input = ({ meetingId, onCheckDuplicate }) => {
    const [name, setName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleInputChange = (e) => {
        setName(e.target.value);
        setErrorMessage("");
    };

    const handleBlur = async () => {
        if (name.trim() === "") {
            setErrorMessage("");
            return;
        }
        const isDuplicate = await onCheckDuplicate(meetingId, name);
        if (isDuplicate) {
            setErrorMessage("중복된 이름입니다.");
        } else {
            setErrorMessage("");
        }
    };

    return (
        <div className="flex flex-col">
            <input
                type="text"
                placeholder="이름을 입력해주세요"
                className="w-[170px] h-[44px] px-2 py-3.5 bg-gray rounded-[5px] inline-flex justify-center items-center gap-2.5 text-[15px] text-black"
                value={name}
                onChange={handleInputChange}
                onBlur={handleBlur}
            />
            {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
        </div>
    );
};

export default Input;
