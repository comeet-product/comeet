export default function Header() {
    return (
        <div className="px-6 py-4 flex justify-start items-center border-b border-gray-300">
            <img 
                src="/logo_text.png" 
                className="w-[15%] min-w-[100px] object-contain" 
                alt="logo" 
            />
        </div>
    );
}