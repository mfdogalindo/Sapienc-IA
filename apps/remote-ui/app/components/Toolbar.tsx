import {
   XMarkIcon,
   ListBulletIcon,
   ClipboardDocumentIcon,
   RectangleGroupIcon,
   ServerStackIcon,
} from "@heroicons/react/24/solid";
import { ToolbarButton } from "./ui/ToolbarButton";
import { useEffect, useState } from "react";
import { useProject } from "~/context/ProjectContext";
import { useLocation, useNavigation } from "@remix-run/react";
import LoadingBar from "./ui/loading-bar";

export default function Toolbar() {
   const [isLogin, setIsLogin] = useState(false);
   const { selectedProject, isLoading, setIsLoading } = useProject();
   const navigation = useNavigation();
   const location = useLocation();

   useEffect(() => {
      setIsLogin(location.pathname === "/");
   }, [location]);

   useEffect(() => {
      if(navigation.state === 'loading') {
         setIsLoading(true);
      }
      if(navigation.state === 'idle') {
         setIsLoading(false);
      }
   }, [navigation.state]);

   const handleLogout = async () => {
      await fetch("/logout", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
      });
      setIsLogin(true);
   };

   // if login hide toolbar
   if (isLogin) return <></>;

   return (
      <div>
         <div className="fixed w-full top-0 z-40 bg-teal-400 bg-opacity-20 backdrop-blur-md h-8 md:h-10 flex items-center px-4">
            {selectedProject ? (
               <div className="flex items-center gap-2">
                  <span className="text-white text-sm md:text-base font-medium truncate">
                     Project: {selectedProject.name}
                  </span>
               </div>
            ) : (
               <span className="text-white text-sm md:text-base opacity-50">No project selected</span>
            )}
         </div>
         {isLoading && <LoadingBar className="top-8 md:top-10" />}
         <div className="fixed top-8 md:top-10 bg-teal-400 bg-opacity-20 w-12 h-[calc(100vh-28px)] md:w-16 md:h-[calc(100vh-36px)] flex flex-col items-center justify-between py-2">
            <div>
               <ToolbarButton navigatePath="/projects" label="Projects">
                  <RectangleGroupIcon className="text-emerald-100" />
               </ToolbarButton>
               <ToolbarButton navigatePath="/clipboard" label="Clipboard">
                  <ClipboardDocumentIcon className="text-emerald-100" />
               </ToolbarButton>
               {selectedProject && (
                  <>
                     <ToolbarButton navigatePath="/todos" label="To-Do">
                        <ListBulletIcon className="text-emerald-100" />
                     </ToolbarButton>

                     <ToolbarButton navigatePath="/fileManager" label="Files">
                        <ServerStackIcon className="text-emerald-100" />
                     </ToolbarButton>
                  </>
               )}
            </div>
            <ToolbarButton onClick={handleLogout} label="Logout">
               <XMarkIcon className="text-red-500" />
            </ToolbarButton>
         </div>
      </div>
   );
}
