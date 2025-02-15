import { XMarkIcon, ListBulletIcon, ClipboardDocumentIcon, SparklesIcon, ServerStackIcon } from "@heroicons/react/16/solid";
import { ToolbarButton } from "./ToolbarButton";
import { useEffect, useState } from "react";
import { set } from "firebase/database";

export default function Toolbar() {
   const [isLogin, setIsLogin] = useState(false);
   useEffect(() => {
      if (window !== undefined) {
         if (window.location.pathname === "/") {
            setIsLogin(true);
         }
      }
   }, []);

   const handleLogout = async () => { 
      await fetch("/logout", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
      });
      setIsLogin(true);
   }

   const handleRoute = (route: string) => { 
      window.location.href = route;
   }

   // if login hide toolbar
   if (isLogin) return <></>;


   return (
   <div className="fixed top-0 bg-gradient-to-br from-teal-800 to-sky-900 w-12 md:w-16 h-screen flex flex-col items-center justify-between py-2">
      <div>
         <ToolbarButton onClick={() => handleRoute("/todos")} label="To-Do" >
            <ListBulletIcon className="text-cyan-200"/>
         </ToolbarButton>
         <ToolbarButton onClick={() => handleRoute("/clipboard")} label="Clipboard" >
            <ClipboardDocumentIcon className="text-amber-100 "/>
         </ToolbarButton>
         <ToolbarButton onClick={() => handleRoute("/projects")} label="Projects" >
            <SparklesIcon className="text-yellow-400"/>
         </ToolbarButton>
         <ToolbarButton onClick={() => handleRoute("/fileManager")} label="Files" className="" >
            <ServerStackIcon className="text-emerald-400"/>
         </ToolbarButton>
      </div>
      <ToolbarButton onClick={handleLogout} label="Logout">
         <XMarkIcon className="text-red-500"/> 
      </ToolbarButton>
   </div>)
}