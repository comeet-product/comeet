'use client';

import React from "react";
import Avatar from "boring-avatars";

const UserItem = ({ id, name, isAddButton = false, isEditMode = false, isSelected, onClick, onAddClick, onEditClick }) => {
    if (isAddButton) {
        return (
            <div className="flex-shrink-0">
                <button 
                    onClick={isEditMode ? onEditClick : onAddClick}
                    className="flex flex-col items-center group py-1 px-2"
                >
                    <img
                        src={isEditMode ? "/editProfile.svg" : "/addprofile.png"}
                        alt={isEditMode ? "사용자 수정" : "사용자 추가"}
                        className="w-8 h-8 rounded-full mb-1 group-hover:opacity-80 transition-opacity"
                    />
                    <span className="text-xs font-normal tracking-[0.06px] text-main group-hover:opacity-80 transition-opacity whitespace-nowrap">
                        {isEditMode ? "수정하기" : "추가하기"}
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
                <div className="w-8 h-8 rounded-full mb-1 overflow-hidden">
                    <Avatar
                        name={id.toString()}
                        variant="beam"
                        size={32}
                        colors={["#3674B5", "#86ACD3", "#B6C9DC", "#D7E3F0", "#F5F5F5"]}
                    />
                </div>
                <span className="text-xs font-normal tracking-[0.06px] text-gray-800 whitespace-nowrap">
                    {name}
                </span>
            </button>
        </div>
    );
};

const UserBar = ({ meetingId, users = [], selectedUser, onUserSelect, onShowSelect, onUserAdded }) => {
    const containerRef = React.useRef(null);

    const handleUserClick = (userId) => {
        if (onUserSelect) {
            onUserSelect(userId);
        }
    };

    const handleAddClick = () => {
        setIsAddMode(true);
    };

    const handleEditClick = () => {
        // 수정 로직은 일단 비워둠
    };

    const handleBack = (newName) => {
        if (newName) {
            const newUser = {
                id: users.length + 1,
                name: newName
            };
            setUsers(prev => [...prev, newUser]);
        }
    };

    return (
        <div className="sticky bottom-0 left-0 right-0 px-5 py-1 bg-gray-200 z-10">
            <div className="relative flex items-center" ref={containerRef}>
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
                        {users.map((user) => (
                            <UserItem 
                                key={user.userid} 
                                name={user.name} 
                                isSelected={selectedUser === user.userid}
                                onClick={() => handleUserClick(user.userid)}
                            />
                        ))}
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-200 to-transparent pointer-events-none" />
                </div>
                
                <div className="flex-shrink-0">
                    <UserItem 
                        isAddButton 
                        isEditMode={selectedUser !== null}
                        onAddClick={handleAddClick}
                        onEditClick={handleEditClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserBar;