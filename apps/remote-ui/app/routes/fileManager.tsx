import { json } from "@remix-run/node";
import { requireUser } from "server/session.server";
import { 
  uploadProjectFile, 
  deleteProjectFile, 
  getProjectFiles, 
  getFileContent,
  getFileMetadata
} from "../../server/database/project-files-firestore.server";
import FileManager from "~/components/projects/FileManager";

export async function loader({ request }: { request: Request }) {
  await requireUser(request);
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  const fileId = url.searchParams.get("fileId");

  // Handle file preview request
  if (projectId && fileId && url.pathname.includes('/preview')) {
    try {
      const data= await getFileMetadata(projectId, fileId);
      return data;
    } catch (error) {
      console.error('Error fetching file content', error);
      return json({ error: error.message }, { status: 400 });
    }
  }


  if (!projectId) {
    return json({ files: [] });
  }

  const files = await getProjectFiles(projectId);
  return json({ files });
}
 

export async function action({ request }: { request: Request }) {
   await requireUser(request);
   const formData = await request.formData();
   const actionType = formData.get("_action");
   const projectId = formData.get("projectId") as string;
 
   if (actionType === "upload") {
     const file = formData.get("file") as File;
     try {
       // Pass the buffer (or convert it as needed) to your upload function
       const fileMetadata = await uploadProjectFile(projectId, file);
       return json({ success: true, file: fileMetadata });
     } catch (error) {
       console.error("Error uploading file", error);
       return json({ error: (error as Error).message }, { status: 400 });
     }
   }
 
   if (actionType === "delete") {
     const fileId = formData.get("fileId") as string;
     try {
       await deleteProjectFile(projectId, fileId);
       return json({ success: true, deletedFileId: fileId });
     } catch (error) {
       return json({ error: (error as Error).message }, { status: 400 });
     }
   }
 
   return json({ error: "Invalid action" }, { status: 400 });
 }
 

export default function FileManagerPage() {
  return (
    <div className="app-container">
      <FileManager />
    </div>
  );
}