"use client";

import React, { useState } from "react";

const Input = ({ value, onChange, placeholder, className = "", onCheckDuplicate }) => {
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
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full h-full px-3 border border-main/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-main focus:border-main"
            />
        </div>
    );
};

export default Input;
