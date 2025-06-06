"use client";

import React from "react";
import Avatar from "boring-avatars";

const UserItem = ({
    id,
    name,
    isAddButton = false,
    isEditMode = false,
    isSelected,
    onClick,
    onAddClick,
    onEditClick,
    isScrolling,
    isAvailable,
    isHighlighted,
}) => {
    const [isPressed, setIsPressed] = React.useState(false);
    const touchStartRef = React.useRef(null);

    const handleTouchStart = (e) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            time: Date.now(),
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
                        src={
                            isEditMode ? "/editProfile.svg" : "/addprofile.png"
                        }
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
                className={`flex flex-col items-center py-1 px-2 rounded-lg cursor-pointer transition-all duration-200 border touch-none select-none ${
                    isSelected
                        ? "bg-main/20 border-main"
                        : isHighlighted
                        ? "bg-green-100 border-green-300"
                        : "border-transparent"
                }`}
                style={{
                    WebkitTapHighlightColor: "transparent",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                    backgroundColor: isSelected
                        ? "rgba(25, 118, 210, 0.2)"
                        : isHighlighted
                        ? "rgba(34, 197, 94, 0.1)"
                        : "transparent",
                    opacity: isAvailable === false ? 0.4 : 1, // 불가능한 사용자는 반투명
                }}
                onMouseEnter={(e) => {
                    if (!isSelected && e.currentTarget) {
                        const color = isHighlighted
                            ? "rgba(34, 197, 94, 0.15)"
                            : "rgba(25, 118, 210, 0.1)";
                        e.currentTarget.style.backgroundColor = color;
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isSelected && e.currentTarget) {
                        const color = isHighlighted
                            ? "rgba(34, 197, 94, 0.1)"
                            : "transparent";
                        e.currentTarget.style.backgroundColor = color;
                    }
                }}
                onTouchStart={(e) => {
                    if (!isSelected && e.currentTarget) {
                        const color = isHighlighted
                            ? "rgba(34, 197, 94, 0.15)"
                            : "rgba(25, 118, 210, 0.1)";
                        e.currentTarget.style.backgroundColor = color;
                    }
                }}
                onTouchEnd={(e) => {
                    if (!isSelected && e.currentTarget) {
                        const color = isHighlighted
                            ? "rgba(34, 197, 94, 0.1)"
                            : "transparent";
                        e.currentTarget.style.backgroundColor = color;
                    }
                }}
                onTouchCancel={(e) => {
                    if (!isSelected && e.currentTarget) {
                        const color = isHighlighted
                            ? "rgba(34, 197, 94, 0.1)"
                            : "transparent";
                        e.currentTarget.style.backgroundColor = color;
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
                        colors={[
                            "#3674B5",
                            "#86ACD3",
                            "#B6C9DC",
                            "#D7E3F0",
                            "#F5F5F5",
                        ]}
                    />
                </div>
                <span
                    className={`text-xs font-normal tracking-[0.06px] max-w-12 truncate ${
                        isHighlighted
                            ? "text-green-700 font-medium"
                            : "text-gray-800"
                    }`}
                >
                    {name}
                </span>
            </button>
        </div>
    );
};

const UserBar = ({
    meetingId,
    users = [],
    selectedUser = null,
    selectedCell = null,
    selectedCells = [],
    onUserSelect = () => {},
    onShowSelect = () => {},
    onUserAdded = () => {},
}) => {
    const containerRef = React.useRef(null);
    const scrollContainerRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragStart, setDragStart] = React.useState({ x: 0, scrollLeft: 0 });

    // 정렬 상태를 별도로 관리
    const [lastSortState, setLastSortState] = React.useState(null);

    // 현재 활성 셀이 있는지 확인 (단일 셀 선택 또는 연속 셀 선택)
    const hasActiveCell =
        selectedCell || (selectedCells && selectedCells.length > 0);

    // 선택된 셀에 따라 사용자들을 정렬하고 상태를 설정
    const processedUsers = React.useMemo(() => {
        // 새로운 셀이 선택되었을 때만 정렬 상태 업데이트
        if (
            (selectedCell && selectedCell !== lastSortState?.selectedCell) ||
            (selectedCells &&
                selectedCells.length > 0 &&
                JSON.stringify(selectedCells) !==
                    JSON.stringify(lastSortState?.selectedCells))
        ) {
            // 단일 셀 선택의 경우
            if (selectedCell) {
                const availableMembers = selectedCell.members || [];
                console.log("Selected cell members:", availableMembers);
                console.log("All users:", users);

                const processedList = users.map((user) => {
                    const isAvailable = availableMembers.includes(user.name);
                    return {
                        ...user,
                        available: isAvailable,
                        highlighted: isAvailable,
                    };
                });

                // 가능한 사용자들을 먼저, 불가능한 사용자들을 뒤에 정렬
                const sortedList = processedList.sort((a, b) => {
                    if (a.available && !b.available) return -1;
                    if (!a.available && b.available) return 1;
                    return 0;
                });

                // 정렬 상태 저장
                setLastSortState({
                    selectedCell: selectedCell,
                    selectedCells: selectedCells,
                    sortedUsers: sortedList,
                });

                return sortedList;
            }
            // 연속 셀 선택의 경우 (selectedCells)
            else if (selectedCells && selectedCells.length > 0) {
                // 연속 셀의 경우 모든 사용자를 하이라이트 처리
                const processedList = users.map((user) => ({
                    ...user,
                    available: true,
                    highlighted: true,
                }));

                setLastSortState({
                    selectedCell: selectedCell,
                    selectedCells: selectedCells,
                    sortedUsers: processedList,
                });

                return processedList;
            }
        }

        // 이전에 정렬된 상태가 있으면 정렬 순서는 유지하되, 하이라이트는 현재 상태에 따라 결정
        if (lastSortState && lastSortState.sortedUsers) {
            return lastSortState.sortedUsers
                .map((user) => {
                    const updatedUser = users.find(
                        (u) => u.userid === user.userid
                    );
                    if (!updatedUser) return null; // 삭제된 사용자

                    // 하이라이트는 현재 선택 상태에 따라 결정
                    let highlighted = false;
                    let available = true;

                    if (selectedCell) {
                        // 단일 셀이 선택된 경우
                        const availableMembers = selectedCell.members || [];
                        available = availableMembers.includes(user.name);
                        highlighted = available;
                    } else if (selectedCells && selectedCells.length > 0) {
                        // 연속 셀이 선택된 경우
                        highlighted = true;
                        available = true;
                    } else {
                        // 아무것도 선택되지 않은 경우
                        highlighted = false;
                        available = true;
                    }

                    return {
                        ...updatedUser,
                        available: available,
                        highlighted: highlighted,
                    };
                })
                .filter((user) => user !== null); // 삭제된 사용자 제거
        }

        // 아직 정렬 상태가 없으면 원본 사용자 목록 반환
        return users.map((user) => ({
            ...user,
            available: true,
            highlighted: false,
        }));
    }, [users, selectedCell, selectedCells, lastSortState]);

    const handleUserClick = (userId) => {
        onUserSelect(userId);
    };

    const handleAddClick = () => {
        // Edit 페이지로 이동
        onShowSelect();
    };

    const handleEditClick = () => {
        // Edit 페이지로 이동 (선택된 사용자와 함께)
        onShowSelect();
    };

    // 마우스 드래그 스크롤 이벤트 핸들러
    const handleMouseDown = (e) => {
        // 터치 디바이스가 아닌 경우에만 마우스 드래그 적용
        if (typeof window !== "undefined" && "ontouchstart" in window) return;

        setIsDragging(true);
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            setDragStart({
                x: e.clientX,
                scrollLeft: scrollContainer.scrollLeft,
            });
            scrollContainer.style.cursor = "grabbing";
            scrollContainer.style.userSelect = "none";
        }
    };

    const handleMouseMove = (e) => {
        if (
            !isDragging ||
            (typeof window !== "undefined" && "ontouchstart" in window)
        )
            return;

        e.preventDefault();
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            const deltaX = e.clientX - dragStart.x;
            scrollContainer.scrollLeft = dragStart.scrollLeft - deltaX;
        }
    };

    const handleMouseUp = () => {
        if (typeof window !== "undefined" && "ontouchstart" in window) return;

        setIsDragging(false);
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.style.cursor = "grab";
            scrollContainer.style.userSelect = "";
        }
    };

    // 전역 마우스 이벤트 리스너
    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging, dragStart]);

    return (
        <>
            <style jsx>{`
                .custom-scrollbar {
                    scrollbar-width: thin !important;
                    scrollbar-color: #f5f5f5 transparent !important;
                    -ms-overflow-style: auto !important;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px !important;
                    -webkit-appearance: none !important;
                    display: block !important;
                    width: 8px !important;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent !important;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    border-radius: 4px !important;
                    transition: all 0.2s ease !important;
                    min-height: 20px !important;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    transform: scaleY(1.3) !important;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:active {
                    transform: scaleY(1.5) !important;
                }

                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    transform: scaleY(1.3) !important;
                }

                .custom-scrollbar:active::-webkit-scrollbar-thumb,
                .custom-scrollbar.dragging::-webkit-scrollbar-thumb {
                    transform: scaleY(1.5) !important;
                }

                @media (pointer: coarse) {
                    .custom-scrollbar::-webkit-scrollbar {
                        height: 10px !important;
                    }

                    .custom-scrollbar::-webkit-scrollbar-thumb:active {
                        transform: scaleY(1.8) !important;
                    }
                }
            `}</style>
            <div className="absolute bottom-0 left-0 right-0 px-5 py-1 bg-gray-200 z-10">
                <div className="relative flex items-center" ref={containerRef}>
                    <div className="relative flex-1 overflow-hidden">
                        <div
                            ref={scrollContainerRef}
                            className="flex items-center px-2 gap-2 custom-scrollbar"
                            style={{
                                WebkitOverflowScrolling: "touch",
                                scrollSnapType: "x mandatory",
                                width: "100%",
                                paddingBottom: "8px",
                                cursor: isDragging
                                    ? "grabbing"
                                    : typeof window !== "undefined" &&
                                      "ontouchstart" in window
                                    ? "default"
                                    : "grab",
                                overflowX: "scroll",
                                overflowY: "hidden",
                            }}
                            onMouseDown={handleMouseDown}
                        >
                            {processedUsers.map((user) => (
                                <UserItem
                                    key={user.userid}
                                    id={user.userid}
                                    name={user.name}
                                    isSelected={selectedUser === user.userid}
                                    onClick={() => handleUserClick(user.userid)}
                                    isAvailable={user.available}
                                    isHighlighted={user.highlighted}
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
        </>
    );
};

export default UserBar;
