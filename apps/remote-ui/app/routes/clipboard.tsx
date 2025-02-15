import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { publishText, getText  } from "server/database/clipboard-db.server";
import { json } from "@remix-run/node";
import { requireUser } from "server/session.server";

export async function loader({ request }: { request: Request }) {
  await requireUser(request);
   const initialContent = await getText();
   return json({ content: initialContent });
}

export async function action({ request }: { request: Request }) {
   const formData = await request.formData();
   const text = formData.get("text") as string;
   await publishText(text);
   return json({ success: true });
}


export default function TextEditor() {
   const [content, setContent] = useState("");
   const [isLoading, setIsLoading] = useState(true);
   const fetcher = useFetcher<{ content: string }>();
 
   // Referencia para almacenar el temporizador de debounce
   const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   // Referencia para pausar la actualización automática mientras se escribe
   const isPausedRef = useRef(false);
 
   // Intervalo para refrescar el contenido automáticamente.
   useEffect(() => {
     const intervalId = setInterval(() => {
       // Solo se refresca si no se está escribiendo
       if (!isPausedRef.current) {
         fetcher.load(window.location.pathname);
       }
     }, 300); 
 
     return () => clearInterval(intervalId);
   }, [fetcher]);
 
   useEffect(() => {
     if (fetcher.data) {
       setContent(fetcher.data.content);
       setIsLoading(false);
     }
   }, [fetcher.data]);
 
   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
     const newContent = e.target.value;
     setContent(newContent);
 
     isPausedRef.current = true;
 
     if (debounceTimeoutRef.current) {
       clearTimeout(debounceTimeoutRef.current);
     }

     if(pauseTimeoutRef.current){
         clearTimeout(pauseTimeoutRef.current);
     }
 
     debounceTimeoutRef.current = setTimeout(async () => {
       try {
         await fetch("/clipboard", {
           method: "POST",
           headers: {
             "Content-Type": "application/x-www-form-urlencoded",
           },
           body: new URLSearchParams({ text: newContent }).toString(),
         });
       } catch (error) {
         console.error("Error al actualizar el servidor:", error);
       }
     }, 100); 

     pauseTimeoutRef.current = setTimeout(() => {
         isPausedRef.current = false;
      }, 2000);
   };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="app-container shadow-xl p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-white">Live Text Clipboard</h1>

      {/* Área de texto */}
      <div className="">
        <textarea
          value={content}
          onChange={handleChange}
          className="text-sm text-black md:text-base w-full h-[calc(100vh_-_68px)] md:h-[calc(100vh_-_5rem)] p-2  shadow-sm resize-none focus:outline-none bg-white bg-opacity-70"
          placeholder="Escribe o pega tu texto aquí..."
          spellCheck="false"
        />
        <div className="absolute bottom-1 right-4 text-sm text-gray-500">
          {content.length} caracteres
        </div>
      </div>
    </div>
  );
}