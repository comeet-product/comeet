import React from "react";
import Time from "./TimeSelect";

export default function SelectableTime() {
    return (
        <div className="flex items-center bg-white w-[315px] px-[14.13px]">
            <span className="text-black whitespace-nowrap">선택 가능 시간</span>
            <div className="flex items-center gap-x-[5px] ml-auto">
                <Time text="10:00 AM" />
                <span className="text-black whitespace-nowrap">~</span>
                <Time text="10:00 AM" />
            </div>
        </div>
    );
}
