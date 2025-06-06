"use client";

import React, { useState } from "react";

const Input = ({ value, onChange, placeholder, className = "", onCheckDuplicate, type = "text" }) => {
    const [isDuplicate, setIsDuplicate] = useState(false);

    const handleChange = (e) => {
        const newValue = e.target.value;
        onChange(e);
        if (onCheckDuplicate) {
            setIsDuplicate(onCheckDuplicate(newValue));
        }
    };

    return (
        <div className={`h-full ${className}`}>
            <input
                type={type}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full h-full px-2 border border-main/50 text-black text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-main focus:border-main"
            />
        </div>
    );
};

export default Input;
