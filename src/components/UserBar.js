'use client';

import React from "react";
import Avatar from "boring-avatars";

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

const UserItem = ({ id, name, isAddButton = false, isEditMode = false, isSelected, onClick, onAddClick, onEditClick, isScrolling }) => {
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
                    if (!isSelected && e.currentTarget && !isScrolling) {
                        e.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.1)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isSelected && e.currentTarget) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }
                }}
                onClick={(e) => {
                    if (!isScrolling) {
                        e.preventDefault();
                        e.stopPropagation();
                        onClick();
                    }
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

const UserBar = () => {
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [users, setUsers] = React.useState(USERS);
    const containerRef = React.useRef(null);
    const scrollContainerRef = React.useRef(null);
    
    // 스크롤 상태 관리
    const [isScrolling, setIsScrolling] = React.useState(false);
    const scrollStateRef = React.useRef({
        isMouseDown: false,
        startX: 0,
        scrollLeft: 0,
        touchStartX: 0,
        touchStartTime: 0,
        hasMoved: false
    });

    const handleUserClick = (id) => {
        setSelectedUser(prev => prev === id ? null : id);
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

    // 마우스 드래그 스크롤 구현
    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // 왼쪽 클릭만
        
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        scrollStateRef.current.isMouseDown = true;
        scrollStateRef.current.startX = e.pageX - scrollContainer.offsetLeft;
        scrollStateRef.current.scrollLeft = scrollContainer.scrollLeft;
        scrollStateRef.current.hasMoved = false;
        
        scrollContainer.style.cursor = 'grabbing';
        scrollContainer.style.userSelect = 'none';
        
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!scrollStateRef.current.isMouseDown) return;
        
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        e.preventDefault();
        
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - scrollStateRef.current.startX) * 2; // 스크롤 속도 조절
        
        if (Math.abs(walk) > 5) { // 5px 이상 움직였을 때만 스크롤로 인식
            scrollStateRef.current.hasMoved = true;
            setIsScrolling(true);
        }
        
        scrollContainer.scrollLeft = scrollStateRef.current.scrollLeft - walk;
    };

    const handleMouseUp = () => {
        if (scrollStateRef.current.isMouseDown) {
            const scrollContainer = scrollContainerRef.current;
            if (scrollContainer) {
                scrollContainer.style.cursor = 'grab';
                scrollContainer.style.userSelect = '';
            }
            
            scrollStateRef.current.isMouseDown = false;
            
            // 스크롤이 끝난 후 잠시 기다렸다가 클릭 가능하게 설정
            if (scrollStateRef.current.hasMoved) {
                setTimeout(() => {
                    setIsScrolling(false);
                }, 100);
            } else {
                setIsScrolling(false);
            }
        }
    };

    const handleMouseLeave = () => {
        if (scrollStateRef.current.isMouseDown) {
            handleMouseUp();
        }
    };

    // 터치 스크롤 개선
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        scrollStateRef.current.touchStartX = touch.clientX;
        scrollStateRef.current.touchStartTime = Date.now();
        scrollStateRef.current.hasMoved = false;
    };

    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - scrollStateRef.current.touchStartX);
        
        if (deltaX > 10) { // 10px 이상 움직였을 때 스크롤로 인식
            scrollStateRef.current.hasMoved = true;
            setIsScrolling(true);
        }
    };

    const handleTouchEnd = () => {
        const touchDuration = Date.now() - scrollStateRef.current.touchStartTime;
        
        // 터치 시간이 짧고 움직임이 적으면 클릭으로 인식
        if (!scrollStateRef.current.hasMoved && touchDuration < 300) {
            setIsScrolling(false);
        } else if (scrollStateRef.current.hasMoved) {
            // 스크롤이 끝난 후 잠시 기다렸다가 클릭 가능하게 설정
            setTimeout(() => {
                setIsScrolling(false);
            }, 150);
        }
    };

    // 스크롤 이벤트 리스너 등록
    React.useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        // 마우스 이벤트
        scrollContainer.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        scrollContainer.addEventListener('mouseleave', handleMouseLeave);

        // 터치 이벤트
        scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
        scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
        scrollContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            scrollContainer.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
            scrollContainer.removeEventListener('touchstart', handleTouchStart);
            scrollContainer.removeEventListener('touchmove', handleTouchMove);
            scrollContainer.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    return (
        <div className="sticky bottom-0 left-0 right-0 px-5 py-1 bg-gray-200 z-10">
            <div className="relative flex items-center" ref={containerRef}>
                <div className="relative flex-1 overflow-hidden">
                    <div 
                        ref={scrollContainerRef}
                        className="flex items-center overflow-x-auto px-2 gap-2"
                        style={{ 
                            WebkitOverflowScrolling: 'touch',
                            scrollSnapType: 'x mandatory',
                            width: '100%',
                            paddingBottom: '4px',
                            cursor: 'grab'
                        }}
                    >
                        {users.map((user) => (
                            <UserItem 
                                key={user.id}
                                id={user.id}
                                name={user.name} 
                                isSelected={selectedUser === user.id}
                                onClick={() => handleUserClick(user.id)}
                                isScrolling={isScrolling}
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
                        isScrolling={isScrolling}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserBar;