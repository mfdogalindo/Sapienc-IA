import { ReactElement } from "react";

type ToolbarButtonProps = {
   children: ReactElement;
   label?: string;
   className?: string;
   onClick: () => void;
 };
 
 export const ToolbarButton = ({ children, onClick, label, className }: ToolbarButtonProps) => {
   return (
    <div className="flex flex-col items-center justify-center py-1">
     <button onClick={onClick} className={'btn p-1 btn-primary h-10 w-10 md:h-12 md:w-12 bg-white border-2 border-transparent hover:border-teal-600 bg-opacity-10 hover:bg-opacity-30 ' + className}>
       {children}
     </button>
     <span className="text-[10px] md:text-xs text-white">{label}</span>
    </div>

   );
 };