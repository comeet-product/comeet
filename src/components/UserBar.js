'use client';

import React from "react";

const UserItem = ({ name, isAddButton = false, isSelected, onClick, onAddClick }) => {
    if (isAddButton) {
        return (
            <div className="flex-shrink-0">
                <button 
                    onClick={onAddClick}
                    className="flex flex-col items-center group py-1 px-2"
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
        <div className="flex-shrink-0">
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

    const handleUserClick = (id) => {
        setSelectedUser(prev => prev === id ? null : id);
    };

    const handleAddClick = () => {
        setIsAddMode(true);
        // 로직 추가 예정
    };

    return (
        <div className="sticky bottom-0 left-0 right-0 px-5 py-1 bg-gray-200 z-10">
            <div className="relative flex items-center" ref={containerRef}>
                {/* UserItem들 영역 */}
                <div className="relative flex-1 overflow-hidden">
                    <div 
                        className="flex items-center overflow-x-auto px-2 gap-2"
                        style={{ 
                            WebkitOverflowScrolling: 'touch',
                            scrollSnapType: 'x mandatory',
                            width: '100%',
                            paddingBottom: '4px'
                        }}
                    >
                        {USERS.map((user) => (
                            <UserItem 
                                key={user.id} 
                                name={user.name} 
                                isSelected={selectedUser === user.id}
                                onClick={() => handleUserClick(user.id)}
                            />
                        ))}
                    </div>
                    {/* UserItem들이 서서히 사라지는 그라데이션 */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-200 to-transparent pointer-events-none" />
                </div>
                
                {/* 추가하기 버튼 영역 */}
                <div className="flex-shrink-0">
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