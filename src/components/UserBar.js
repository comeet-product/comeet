'use client';

import React from "react";

const UserItem = ({ name, isAddButton = false, isSelected, onClick, onAddClick }) => {
    if (isAddButton) {
        return (
            <div className="flex flex-col items-center py-1 px-2">
                <button 
                    onClick={onAddClick}
                    className="flex flex-col items-center group"
                >
                    <img
                        src="/addprofile.png"
                        alt="사용자 추가"
                        className="w-8 h-8 rounded-full mb-1 group-hover:opacity-80 transition-opacity"
                    />
                    <span className="text-xs font-normal tracking-[0.06px] text-main group-hover:opacity-80 transition-opacity">
                        추가하기
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div 
            className={`flex flex-col items-center py-1 px-2 rounded-lg cursor-pointer transition-colors hover:bg-main/10 border ${isSelected ? 'bg-main/20 border-main' : 'border-transparent'}`}
            onClick={onClick}
        >
            <img
                src="/profile.png"
                alt={`${name}의 프로필`}
                className="w-8 h-8 rounded-full mb-1"
            />
            <span className="text-xs font-normal tracking-[0.06px] text-gray-800">
                {name}
            </span>
        </div>
    );
};

const USERS = [
    { name: "서윤" },
    { name: "예진" },
    { name: "재완" },
    { name: "기훈" },
];

const UserBar = () => {
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [isAddMode, setIsAddMode] = React.useState(false);

    const handleUserClick = (name) => {
        if (selectedUser === name) {
            setSelectedUser(null);
        } else {
            setSelectedUser(name);
        }
    };

    const handleAddClick = () => {
        setIsAddMode(true);
        // 로직 추가 예정
    };

    return (
        <div className="sticky bottom-0 left-0 right-0 py-1 flex justify-center items-center gap-2 bg-gray-200">
            {USERS.map((user) => (
                <UserItem 
                    key={user.name} 
                    name={user.name} 
                    isSelected={selectedUser === user.name}
                    onClick={() => handleUserClick(user.name)}
                />
            ))}
            <UserItem 
                isAddButton 
                onAddClick={handleAddClick}
            />
        </div>
    );
};

export default UserBar;
