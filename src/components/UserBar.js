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
    const [isPressed, setIsPressed] = React.useState(false);
    const touchStartRef = React.useRef(null);

    const handleTouchStart = (e) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            time: Date.now()
        };
        setIsPressed(true);
    };

    const handleTouchMove = (e) => {
        if (!touchStartRef.current) return;
        
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
        
        // 가로 스크롤이 세로 스크롤보다 크면 스크롤로 인식
        if (deltaX > deltaY && deltaX > 3) {
            setIsPressed(false);
        }
    };

    const handleTouchEnd = () => {
        setIsPressed(false);
        touchStartRef.current = null;
    };

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
                } ${isPressed && !isScrolling ? 'bg-main/10' : ''}`}
                style={{
                    WebkitTapHighlightColor: 'transparent', 
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.2)' : 
                                   (isPressed && !isScrolling) ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
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
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
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
        touchStartY: 0,
        touchStartTime: 0,
        hasMoved: false,
        isTouch: false,
        scrollTimeout: null
    });

    const handleUserClick = (userId) => {
        setSelectedUser(userId);
    };

    const handleAddClick = () => {
        // 추가 기능 구현 예정
        console.log('Add user clicked');
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

    // 마우스 드래그 스크롤 구현 (데스크톱용)
    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // 왼쪽 클릭만
        
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        scrollStateRef.current.isMouseDown = true;
        scrollStateRef.current.startX = e.pageX - scrollContainer.offsetLeft;
        scrollStateRef.current.scrollLeft = scrollContainer.scrollLeft;
        scrollStateRef.current.hasMoved = false;
        scrollStateRef.current.isTouch = false;
        
        scrollContainer.style.cursor = 'grabbing';
        scrollContainer.style.userSelect = 'none';
        
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!scrollStateRef.current.isMouseDown || scrollStateRef.current.isTouch) return;
        
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        e.preventDefault();
        
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - scrollStateRef.current.startX) * 2;
        
        if (Math.abs(walk) > 3) { // 3px 이상 움직였을 때만 스크롤로 인식
            scrollStateRef.current.hasMoved = true;
            setIsScrolling(true);
        }
        
        scrollContainer.scrollLeft = scrollStateRef.current.scrollLeft - walk;
    };

    const handleMouseUp = () => {
        if (scrollStateRef.current.isMouseDown && !scrollStateRef.current.isTouch) {
            const scrollContainer = scrollContainerRef.current;
            if (scrollContainer) {
                scrollContainer.style.cursor = 'grab';
                scrollContainer.style.userSelect = '';
            }
            
            scrollStateRef.current.isMouseDown = false;
            
            if (scrollStateRef.current.hasMoved) {
                setTimeout(() => {
                    setIsScrolling(false);
                }, 800); // 터치와 동일하게 800ms로 설정
            } else {
                setIsScrolling(false);
            }
        }
    };

    const handleMouseLeave = () => {
        if (scrollStateRef.current.isMouseDown && !scrollStateRef.current.isTouch) {
            handleMouseUp();
        }
    };

    // 터치 스크롤 개선 (모바일용)
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        scrollStateRef.current.touchStartX = touch.clientX;
        scrollStateRef.current.touchStartY = touch.clientY;
        scrollStateRef.current.touchStartTime = Date.now();
        scrollStateRef.current.hasMoved = false;
        scrollStateRef.current.isTouch = true;
        scrollStateRef.current.isMouseDown = false; // 마우스 이벤트와 충돌 방지
    };

    const handleTouchMove = (e) => {
        if (!scrollStateRef.current.isTouch) return;
        
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - scrollStateRef.current.touchStartX);
        const deltaY = Math.abs(touch.clientY - scrollStateRef.current.touchStartY);
        
        // 가로 스크롤이 세로 스크롤보다 크고, 2px 이상 움직였을 때 스크롤로 인식
        if (deltaX > deltaY && deltaX > 2) {
            scrollStateRef.current.hasMoved = true;
            setIsScrolling(true);
            
            // 세로 스크롤 방지
            e.preventDefault();
        }
    };

    const handleTouchEnd = () => {
        if (!scrollStateRef.current.isTouch) return;
        
        const touchDuration = Date.now() - scrollStateRef.current.touchStartTime;
        
        // 빠른 탭이고 움직임이 적으면 클릭으로 인식
        if (!scrollStateRef.current.hasMoved && touchDuration < 200) {
            setIsScrolling(false);
        } else if (scrollStateRef.current.hasMoved) {
            // 스크롤이 끝난 후 지연시간을 늘려서 스크롤바가 조금 더 오래 보이게 함
            setTimeout(() => {
                setIsScrolling(false);
            }, 800); // 800ms로 증가하여 사용자가 스크롤바를 더 오래 볼 수 있게 함
        } else {
            setIsScrolling(false);
        }
        
        scrollStateRef.current.isTouch = false;
    };

    // 네이티브 스크롤 이벤트 처리
    const handleNativeScroll = () => {
        setIsScrolling(true);
        
        // 스크롤 종료 감지를 위한 디바운스
        if (scrollStateRef.current.scrollTimeout) {
            clearTimeout(scrollStateRef.current.scrollTimeout);
        }
        
        scrollStateRef.current.scrollTimeout = setTimeout(() => {
            setIsScrolling(false);
        }, 800);
    };

    // 스크롤 이벤트 리스너 등록
    React.useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        // 네이티브 스크롤 이벤트 (휠 스크롤, 스크롤바 드래그 등)
        scrollContainer.addEventListener('scroll', handleNativeScroll, { passive: true });

        // 마우스 이벤트 (데스크톱용)
        scrollContainer.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        scrollContainer.addEventListener('mouseleave', handleMouseLeave);

        // 터치 이벤트 (모바일용) - passive를 제거하여 preventDefault 가능하게 함
        scrollContainer.addEventListener('touchstart', handleTouchStart);
        scrollContainer.addEventListener('touchmove', handleTouchMove);
        scrollContainer.addEventListener('touchend', handleTouchEnd);
        scrollContainer.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            if (scrollStateRef.current.scrollTimeout) {
                clearTimeout(scrollStateRef.current.scrollTimeout);
            }
            
            scrollContainer.removeEventListener('scroll', handleNativeScroll);
            scrollContainer.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
            scrollContainer.removeEventListener('touchstart', handleTouchStart);
            scrollContainer.removeEventListener('touchmove', handleTouchMove);
            scrollContainer.removeEventListener('touchend', handleTouchEnd);
            scrollContainer.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, []);

    // 스크롤바 스타일을 동적으로 추가
    React.useEffect(() => {
        const styleId = 'userbar-scrollbar-styles';
        let existingStyle = document.getElementById(styleId);
        
        if (!existingStyle) {
            existingStyle = document.createElement('style');
            existingStyle.id = styleId;
            document.head.appendChild(existingStyle);
        }
        
        existingStyle.textContent = `
            /* 스크롤바 기본 스타일 */
            .scrollbar-thin::-webkit-scrollbar {
                height: 4px;
                display: block !important;
            }
            
            .scrollbar-thin::-webkit-scrollbar-track {
                background: #F3F4F6;
                border-radius: 2px;
            }
            
            .scrollbar-thin::-webkit-scrollbar-thumb {
                background: #D1D5DB;
                border-radius: 2px;
                transition: all 0.2s ease;
            }
            
            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                background: #9CA3AF;
            }

            /* 스크롤바 두꺼운 스타일 */
            .scrollbar-thick::-webkit-scrollbar {
                height: 8px;
                display: block !important;
            }
            
            .scrollbar-thick::-webkit-scrollbar-track {
                background: #F3F4F6;
                border-radius: 4px;
            }
            
            .scrollbar-thick::-webkit-scrollbar-thumb {
                background: #9CA3AF;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .scrollbar-thick::-webkit-scrollbar-thumb:hover {
                background: #6B7280;
            }

            /* Firefox 스크롤바 */
            .scrollbar-thin {
                scrollbar-width: thin;
                scrollbar-color: #D1D5DB #F3F4F6;
            }
            
            .scrollbar-thick {
                scrollbar-width: auto;
                scrollbar-color: #9CA3AF #F3F4F6;
            }

            /* 스크롤바 항상 보이기 */
            .scrollbar-thin, .scrollbar-thick {
                overflow-x: scroll !important;
            }

            /* 스크롤바 전환 애니메이션 */
            .scrollbar-thin::-webkit-scrollbar,
            .scrollbar-thick::-webkit-scrollbar {
                transition: height 0.2s ease;
            }
            
            .scrollbar-thin::-webkit-scrollbar-thumb,
            .scrollbar-thick::-webkit-scrollbar-thumb {
                transition: background-color 0.2s ease, border-radius 0.2s ease;
            }
        `;
        
        return () => {
            // cleanup on unmount
            if (existingStyle && existingStyle.parentNode) {
                existingStyle.parentNode.removeChild(existingStyle);
            }
        };
    }, []);

    return (
        <>
            <div className="sticky bottom-0 left-0 right-0 px-5 py-1.5 bg-gray-200 z-10">
                <div className="relative flex items-center" ref={containerRef}>
                <div className="relative flex-1 overflow-hidden">
                    <div 
                        ref={scrollContainerRef}
                        className={`flex items-center overflow-x-auto px-2 gap-2 ${
                            isScrolling ? 'scrollbar-thick' : 'scrollbar-thin'
                        }`}
                        style={{ 
                            WebkitOverflowScrolling: 'touch',
                            scrollSnapType: 'x mandatory',
                            width: '100%',
                            paddingBottom: '6px',
                            cursor: 'grab',
                            touchAction: 'pan-x', // 가로 스크롤만 허용
                            // 스크롤바 항상 보이기
                            scrollbarWidth: isScrolling ? 'thick' : 'thin',
                            // WebKit 스크롤바 스타일링
                            '--scrollbar-height': isScrolling ? '8px' : '4px',
                            '--scrollbar-thumb-color': isScrolling ? '#9CA3AF' : '#D1D5DB',
                            '--scrollbar-track-color': '#F3F4F6'
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
        </>
    );
};

export default UserBar;