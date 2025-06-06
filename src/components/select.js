'use client';

import React, { useState } from 'react';
import Title from './Title';

const Select = ({ onBack }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onBack(name.trim());
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="px-10 py-8 flex flex-col min-h-screen">
                    <Title />
                    <div className="flex-1 flex flex-col justify-end">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="이름을 입력하세요"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                                    name.trim() 
                                        ? 'bg-main hover:bg-main/90' 
                                        : 'bg-gray-300 cursor-not-allowed'
                                }`}
                            >
                                저장하기
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Select; 