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
     <button onClick={onClick} className={'btn p-1 btn-primary h-12 w-12 bg-black border-2 border-transparent hover:border-teal-600 bg-opacity-20 hover:bg-opacity-40 ' + className}>
       {children}
     </button>
     <span className="text-xs ">{label}</span>
    </div>

   );
 };