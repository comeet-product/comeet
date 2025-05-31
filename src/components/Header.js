export default function Header() {
    return (
        <div className="px-6 py-4 flex justify-start items-center border-b border-gray-300">
            <img 
                src="/logo_text.png" 
                className="w-[15%] min-w-[120px] max-w-[200px] object-contain" 
                alt="logo" 
            />
        </div>
    );
}