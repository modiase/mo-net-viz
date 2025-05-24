const Button = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => {
  return (
    <button
      className="px-4 py-2 color-offwhite border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors duration-200 cursor-pointer min-w-[200px]"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
