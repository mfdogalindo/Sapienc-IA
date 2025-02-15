import { json } from "@remix-run/node";
import { requireUser } from "server/session.server";
import { getProjects } from "server/database/projects-db.server";
import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { FileMetadata, Project } from "server/models";
import { DocumentTextIcon } from "@heroicons/react/16/solid";
const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export async function loader({ request }: { request: Request }) {
   await requireUser(request);
   const projects = await getProjects();
   console.log("RESULT", projects);
   return json(projects);
}

export async function action({ request }: { request: Request }) {

}

const formatFileSize = (bytes: number) => {
   if (bytes < 1024) {
      return bytes + " bytes";
   }
   if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + " KB";
   }
   return (bytes / 1024 / 1024).toFixed(2) + " MB";
}


function ProjectFiles({files, className}: { files: FileMetadata[], className: string }) {
   const [showList, setShowList] = useState(false);
   
   if (!files) {
      return <p className={"italic text-zinc-400 " + className}>No files</p>;
   }

   return (
      <div className={"border border-zinc-700 p-2 " + className}>
         <button onClick={() => setShowList(!showList)}>Files: {files.length}</button>
         {showList && <div className="bg-white bg-opacity-10">
            {files.map((file) => {
               return (
                  <div key={file.id} className="flex gap-2 items-baseline px-2">
                     <DocumentTextIcon className="relative top-1 h-6 w-6 text-zinc-400" />
                     <p>{file.name}</p>
                     <p className="italic text-zinc-400 text-sm">{formatFileSize(file.size)}</p>
                     <p className="italic text-zinc-400 text-sm">{file.type}</p>

                  </div>
               );
            })}   
         </div>}

      </div>
   );
}

export default function ProjectPage() {
   const fetcher = useFetcher<Project[]>();
   useEffect(() => {
      const loadData = async () => {
         console.log("Projects loaded");
         const data = await fetcher.load(window.location.pathname);
         console.log(data, fetcher.data);
      };
      loadData();
   }, []);



   return(
   <div className="app-container">
      <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-white">Projects</h1>

      { fetcher.data && Object.keys(fetcher.data).map((key) => {
         const project = fetcher.data[key];
         return (
            <div key={key} className="grid grid-cols-1 md:grid-cols-2 bg-zinc-400 p-2 bg-opacity-20 mb-4 items-baseline">
               <h2 className="text-lg font-bold text-white">{project.name}</h2>
               <p className="text-xs text-zinc-400 text-right">Created: {new Date(project.createdAt).toLocaleString('es-CO' , { timeZone: localTimeZone })} </p>
               <p className="md:col-span-2 text-white italic font-serif text-zinc-400">{project.description}</p>
               <p>prueba</p>
               <ProjectFiles className="md:col-span-2" files={project.files} />
            </div>
         );
      }
      )}
   </div>);
}