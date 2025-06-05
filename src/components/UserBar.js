'use client';

import React from "react";

const UserItem = ({ name, isAddButton = false, isSelected, onClick, onAddClick, onTimeSelect }) => {
    if (isAddButton) {
        return (
            <div className="flex-shrink-0 flex flex-col items-center py-1 px-2">
                <button 
                    onClick={onAddClick}
                    className="flex flex-col items-center group"
                >
                    <img
                        src="/addprofile.png"
                        alt="사용자 추가"
                        className="w-8 h-8 rounded-full mb-1 group-hover:opacity-80 transition-opacity"
                    />
                    <span className="text-xs font-normal tracking-[0.06px] text-main group-hover:opacity-80 transition-opacity whitespace-nowrap">
                        추가하기
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="relative flex-shrink-0">
            {/* 시간 선택 버튼 - 툴팁 스타일 */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // 부모 onClick 이벤트 방지
                    onTimeSelect?.(name);
                }}
                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 text-xs text-white rounded-lg whitespace-nowrap transition-all duration-300 ${
                    isSelected 
                        ? 'opacity-100 translate-y-0 bg-main/90 hover:bg-main/40' 
                        : 'opacity-0 translate-y-2 pointer-events-none'
                } backdrop-blur-sm hover:!bg-main/40 z-10`}
            >
                수정
            </button>

            <button 
                className={`flex flex-col items-center py-1 px-2 rounded-lg cursor-pointer transition-colors border touch-none select-none ${
                    isSelected 
                        ? 'bg-main/20 border-main' 
                        : 'border-transparent'
                }`}
                style={{
                    WebkitTapHighlightColor: 'transparent',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.2)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                    if (!isSelected && e.currentTarget) {
                        e.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.1)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isSelected && e.currentTarget) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }
                }}
                onTouchStart={(e) => {
                    if (!isSelected && e.currentTarget) {
                        e.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.1)';
                    }
                }}
                onTouchEnd={(e) => {
                    if (!isSelected && e.currentTarget) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }
                }}
                onTouchCancel={(e) => {
                    if (!isSelected && e.currentTarget) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }
                }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClick();
                }}
            >
                <img
                    src="/profile.png"
                    alt={`${name}의 프로필`}
                    className="w-8 h-8 rounded-full mb-1"
                />
                <span className="text-xs font-normal tracking-[0.06px] text-gray-800 whitespace-nowrap">
                    {name}
                </span>
            </button>
        </div>
    );
};

const USERS = [
    { id: 1, name: "서윤" },
    { id: 2, name: "예진" },
    { id: 3, name: "재완" },
    { id: 4, name: "기훈" },
    { id: 5, name: "기훈" },
    { id: 6, name: "기훈" },
    { id: 7, name: "기훈" },
    { id: 8, name: "기훈" },
];

const UserBar = () => {
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [isAddMode, setIsAddMode] = React.useState(false);
    const containerRef = React.useRef(null);

    const handleUserClick = (name) => {
        setSelectedUser(prev => prev === name ? null : name);
    };

    const handleAddClick = () => {
        setIsAddMode(true);
        // 로직 추가 예정
    };

    const handleTimeSelect = (userName) => {
        console.log(`${userName}의 수정 클릭됨`);
        // 시간 선택 로직 추가 예정
    };

    return (
        <div className="sticky bottom-0 left-0 right-0 px-5 py-1 bg-gray-200">
            <div className="relative flex items-center px-2">
                <div className="relative flex-1 mr-16 overflow-hidden">
                    <div 
                        ref={containerRef}
                        className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full pr-8"
                        style={{ 
                            WebkitOverflowScrolling: 'touch',
                            scrollSnapType: 'x mandatory',
                            width: '100%'
                        }}
                    >
                        {USERS.map((user) => (
                            <UserItem 
                                key={user.id} 
                                name={user.name} 
                                isSelected={selectedUser === user.name}
                                onClick={() => handleUserClick(user.name)}
                                onTimeSelect={handleTimeSelect}
                            />
                        ))}
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-200 to-transparent pointer-events-none" />
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                    <UserItem 
                        isAddButton 
                        onAddClick={handleAddClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserBar;