import React, { useEffect } from "react";

const useInputScroll = (ref) => {
    useEffect(() => {
        window.addEventListener("touchmove", handleScroll);
        return () => {
            window.removeEventListener("touchmove", handleScroll);
        };
    }, []);

    const handleScroll = (e) => {
        if (
            document.activeElement == ref.current ||
            ref.current?.contains(e.target)
        ) {
            document.activeElement.blur();
        }
    };
};

export default useInputScroll;
