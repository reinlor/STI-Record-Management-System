import Button from './Button.jsx';
import { useContext } from 'react';
import { AuthContext } from '../AuthProvider.jsx';


export default function Header({ className }) {
  const { authData, logout } = useContext(AuthContext);

  return (
    <header className={className}>
      <div className="h-full w-full flex flex-col bg-[#f3f4f6]">
      <div className="flex items-center justify-between p-4 md:p-8 w-full h-17 gap-4 box-border bg-[#1a1a2e] shadow-md">
        <h2 className="text-[1.2rem] font-bold m-0 text-white ">
          Welcome, <span className="text-[#fef201] font-bold">{authData.displayName}</span>
        </h2>
        <Button
          onClick={logout}
          className="bg-[#dc3545] text-white border-none px-4 py-2 rounded-xl transition-colors duration-200 flex-shrink-0 hover:bg-red-700 font-semibold"
        >
          Logout
        </Button>
      </div>
      </div>
    </header>
  );
}
