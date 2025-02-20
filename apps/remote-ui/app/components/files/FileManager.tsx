import { useEffect, useState } from "react";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { useProject } from "~/context/ProjectContext";
import { FileMetadata, FileWithMetadata } from "server/models";
import { DocumentTextIcon, TrashIcon, ArrowUpTrayIcon } from "@heroicons/react/16/solid";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "../ui/alert-dialog";
import FilePreview from "./FilePreview";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
import FileEditor from "./fileEditor";
import { formatFileSize } from "~/lib/formatters";

const FileManager = () => {
   const { selectedProject, setIsLoading } = useProject();
   const [isNewFile, setIsNewFile] = useState(false);
   const [dragActive, setDragActive] = useState(false);
   const fetcher = useFetcher();
   const [files, setFiles] = useState<FileMetadata[]>([]);
   const [uploadError, setUploadError] = useState<string | null>(null);
   const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
   const loaderData = useLoaderData<FileWithMetadata>();
   const [searchParams] = useSearchParams();

   useEffect(() => {
      const fileId = searchParams.get("fileId");
      const projectId = searchParams.get("projectId");
      const currentPath = window.location.pathname;

      if (fileId && projectId && loaderData?.id === fileId && currentPath.includes("/preview")) {
         setSelectedFile(loaderData);
         // clear search params
         window.history.replaceState({}, "", "/fileManager");
      }

      if (selectedProject) {
         fetcher.load(`/fileManager?projectId=${selectedProject.id}`);
      }
   }, [searchParams, loaderData, selectedProject]);

   // Handle fetcher state updates
   useEffect(() => {
      if (fetcher.state === "idle" && fetcher.data) {
         setIsLoading(false);
         // Handle successful file upload
         if (fetcher.data.file) {
            setFiles((prevFiles) => [...prevFiles, fetcher.data.file]);
            setUploadError(null);
         }
         // Handle file list update
         else if (fetcher.data.files) {
            setFiles(fetcher.data.files);
         }
         // Handle successful deletion
         else if (fetcher.data.success && fetcher.data.deletedFileId) {
            setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fetcher.data.deletedFileId));
         }
         // Handle errors
         if (fetcher.data.error) {
            setUploadError(fetcher.data.error);
         }
      }
   }, [fetcher.state, fetcher.data]);

   const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
         setDragActive(true);
      } else if (e.type === "dragleave") {
         setDragActive(false);
      }
   };

   const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      setUploadError(null);
      setIsLoading(true);

      if (e.dataTransfer.files && e.dataTransfer.files[0] && selectedProject) {
         const formData = new FormData();
         formData.append("file", e.dataTransfer.files[0]);
         formData.append("projectId", selectedProject.id);
         formData.append("_action", "upload");

         fetcher.submit(formData, { method: "POST", encType: "multipart/form-data" });
      }
   };

   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUploadError(null);
      setIsLoading(true);
      if (e.target.files && e.target.files[0] && selectedProject) {
         const formData = new FormData();
         formData.append("file", e.target.files[0]);
         formData.append("projectId", selectedProject.id);
         formData.append("_action", "upload");

         fetcher.submit(formData, { method: "POST", encType: "multipart/form-data" });
      }
   };

   const handleDelete = (fileId: string) => {
      if (selectedProject) {
         setIsLoading(true);
         const formData = new FormData();
         formData.append("fileId", fileId);
         formData.append("projectId", selectedProject.id);
         formData.append("_action", "delete");
         fetcher.submit(formData, { method: "POST" });
      }
   };

   if (!selectedProject) {
      return (
         <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Please select a project first</p>
         </div>
      );
   }

   return (
      <div className="h-full">
         <div className="mb-6 flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-bold text-white mb-2">File Manager</h1>
            <p className="text-gray-400">Upload and manage files for project: {selectedProject.name}</p>
            </div>
            <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors" onClick={() => setIsNewFile(true)}>
                Create File
            </button>
         </div>

         {/* Upload Area */}
         <div
            className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors
          ${dragActive ? "border-teal-500 bg-teal-500 bg-opacity-10" : "border-gray-600"}
          ${fetcher.state === "submitting" ? "opacity-50" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
         >
            <div className="flex flex-col items-center">
               <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-4" />
               <p className="text-lg text-gray-300 mb-2">Drag and drop files here, or click to select</p>
               <p className="text-sm text-gray-500 mb-4">
                  Supported formats: TXT, CSV, JSON, JS, TS, JSX, TSX, MD, PY, YML, YAML (Max 1MB)
               </p>

               <label className="cursor-pointer bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors">
                  Select File
                  <input
                     type="file"
                     className="hidden"
                     onChange={handleFileSelect}
                     accept=".txt,.csv,.json,.js,.ts,.jsx,.tsx,.md,.py,.yml,.yaml"
                  />
               </label>
            </div>
         </div>

         {uploadError && <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-md mb-6">{uploadError}</div>}

         {/* File List */}
         <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file) => (
               <div
                  key={file.id}
                  className="bg-zinc-800 rounded-lg p-4 flex items-start justify-between group hover:bg-zinc-700 transition-colors"
               >
                  <div className="flex items-start space-x-3 cursor-pointer" onClick={() => setSelectedFile(file)}>
                     <DocumentTextIcon className="w-6 h-6 text-teal-400 flex-shrink-0" />
                     <div>
                        <h3 className="text-white font-medium truncate">{file.name}</h3>
                        <p className="text-gray-400 text-sm">{ formatFileSize(file.size) }</p>
                        <p className="text-gray-500 text-xs">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                     </div>
                  </div>

                  <AlertDialog>
                     <AlertDialogTrigger asChild>
                        <button className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                           <TrashIcon className="w-5 h-5" />
                        </button>
                     </AlertDialogTrigger>
                     <AlertDialogContent className="bg-zinc-900 border border-zinc-800">
                        <AlertDialogHeader>
                           <AlertDialogTitle className="text-white">Delete File</AlertDialogTitle>
                           <AlertDialogDescription className="text-zinc-400">
                              Are you sure you want to delete "{file.name}"? This action cannot be undone.
                           </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           <AlertDialogCancel className="bg-zinc-800 text-white hover:bg-zinc-700">
                              Cancel
                           </AlertDialogCancel>
                           <AlertDialogAction
                              onClick={() => handleDelete(file.id)}
                              className="bg-red-600 text-white hover:bg-red-700"
                           >
                              Delete
                           </AlertDialogAction>
                        </AlertDialogFooter>
                     </AlertDialogContent>
                  </AlertDialog>
               </div>
            ))}
         </div>

         {selectedFile && (
            <FileEditor projectId={selectedProject.id} file={selectedFile} onClose={() => setSelectedFile(null)} />
         )}

         {isNewFile && (
            <FileEditor
               projectId={selectedProject.id}
               onClose={() => setIsNewFile(false)}
            />
         )}
      </div>
   );
};

export default FileManager;
