import React from "react";

const UserBar = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 w-full h-[71px] py-[10px] flex justify-center items-center gap-x-[18.5px] bg-gray-200">
            <div className="flex flex-col items-center pl-[28px]">
                <img
                    src="/profile.png"
                    alt="User Profile"
                    className="w-[30px] h-[30px] rounded-full mb-1"
                />
                <span className="text-[11px] font-normal tracking-[0.06px] text-gray-800">
                    서윤
                </span>
            </div>

            <div className="flex flex-col items-center">
                <img
                    src="/profile.png"
                    alt="User Profile"
                    className="w-[30px] h-[30px] rounded-full mb-1"
                />
                <span className="text-[11px] font-normal tracking-[0.06px] text-gray-800">
                    예진
                </span>
            </div>

            <div className="flex flex-col items-center">
                <img
                    src="/profile.png"
                    alt="User Profile"
                    className="w-[30px] h-[30px] rounded-full mb-1"
                />
                <span className="text-[11px] font-normal tracking-[0.06px] text-gray-800">
                    재완
                </span>
            </div>

            <div className="flex flex-col items-center">
                <img
                    src="/profile.png"
                    alt="User Profile"
                    className="w-[30px] h-[30px] rounded-full mb-1"
                />
                <span className="text-[11px] font-normal tracking-[0.06px] text-gray-800">
                    기훈
                </span>
            </div>

            <div className="flex flex-col items-center pr-[28px]">
                <div className="w-[30px] h-[30px] rounded-full bg-blue-200 flex items-center justify-center mb-1">
                    <span className="text-blue-600 text-[30px]">+</span>
                </div>
                <span className="text-[11px] font-normal tracking-[0.06px] text-blue-600">
                    추가하기
                </span>
            </div>
        </div>
    );
};

export default UserBar;
