import { useLocation, useNavigate } from "@remix-run/react";
import { ReactElement } from "react";

type ToolbarButtonProps = {
   children: ReactElement;
   label?: string;
   className?: string;
   navigatePath?: string;
   onClick?: () => void;
};

export const ToolbarButton = ({ children, onClick, label, className, navigatePath }: ToolbarButtonProps) => {
   const navigate = useNavigate();
   const location = useLocation();

   const isSelected = () => { 
     return navigatePath?.includes(location.pathname) ?? false;
   }

   const handleClick = () => {
      if (navigatePath) {
          navigate(navigatePath);
        }
        if (onClick) {
          onClick();
        }
   };

   return (
      <div className="flex flex-col items-center justify-center py-1">
         <button
            onClick={handleClick}
            className={`btn p-1 btn-primary h-10 w-10 md:h-12 md:w-12 bg-white border-2 border-transparent bg-opacity-10 hover:bg-opacity-30 ${className} ${isSelected() ? "border-l-teal-300 border-l-4 bg-opacity-20" : ""}`}
         >
            {children}
         </button>
         <span className="text-[10px] md:text-xs text-white">{label}</span>
      </div>
   );
};
