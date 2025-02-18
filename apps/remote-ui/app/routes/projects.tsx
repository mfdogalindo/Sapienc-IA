import { json } from "@remix-run/node";
import { requireUser } from "server/session.server";
import { getProjects, deleteProject, createProject, updateProject } from "server/database/projects-db.server";
import { useEffect, useState } from "react";
import { useFetcher, useNavigation } from "@remix-run/react";
import { Project, ProjectCreate } from "server/models";
import { useProject } from "~/context/ProjectContext";
import { ProjectFormModal } from "~/components/projects/EditProjectModal";
import { PlusIcon, PencilIcon } from "@heroicons/react/16/solid";
import { ProjectFiles } from "~/components/projects/ProjectFiles";
import DeleteProjectButton from "~/components/projects/DeleteProjectButton";
import { set } from "firebase/database";

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export async function loader({ request }: { request: Request }) {
   await requireUser(request);
   const projects = await getProjects();
   return json(projects);
}

export async function action({ request }: { request: Request }) {
   const formData = await request.formData();
   const action = formData.get("_action");

   if (action === "create") {
      const data: ProjectCreate = {
         name: formData.get("name") as string,
         description: formData.get("description") as string,
         objective: formData.get("objective") as string,
      };
      await createProject(data);
      return json({ success: true });
   }

   if (action === "edit") {
      const projectId = formData.get("projectId") as string;
      const data: ProjectCreate = {
         name: formData.get("name") as string,
         description: formData.get("description") as string,
         objective: formData.get("objective") as string,
      };
      await updateProject(projectId, data);
      return json({ success: true });
   }

   if (action === "delete") {
      const projectId = formData.get("projectId") as string;
      console.log("Deleting project", projectId);
      await deleteProject(projectId);
      return json({ success: true });
   }

   return json({ success: false });
}

export default function ProjectPage() {
   const fetcher = useFetcher<Project[]>();
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingProject, setEditingProject] = useState<Project | null>(null);
   const { selectedProject, setSelectedProject, setIsLoading } = useProject();
   const navigation = useNavigation();

   const loadProjects = async () => {
      setIsLoading(true);
      await fetcher.load(window.location.pathname);
      setIsLoading(false);
   };

   useEffect(() => {
      loadProjects();
   }, []);

   useEffect(() => {
      if (selectedProject && fetcher.data) {
         const projectStillExists = Object.values(fetcher.data).some((project) => project.id === selectedProject.id);
         if (!projectStillExists) {
            setSelectedProject(null);
         }
      }
      if (navigation.state === "idle") {
         setIsLoading(false);
      }
   }, [fetcher.data, selectedProject, setSelectedProject]);

   const handleEditProject = (project: Project) => {
      setEditingProject(project);
      setIsModalOpen(true);
   };

   const handleCloseModal = () => {
      setIsModalOpen(false);
      setIsLoading(true);
      setEditingProject(null);
      if (navigation.state === "idle") {
         loadProjects();
      }
   };

   return (
      <div className="app-container">
         <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-white">Projects</h1>
            <button
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
               <PlusIcon className="h-5 w-5" />
               New Project
            </button>
         </div>

         {fetcher.data &&
            Object.keys(fetcher.data).map((key) => {
               const project = fetcher.data[key];
               const isSelected = selectedProject?.id === project.id;

               return (
                  <div
                     key={key}
                     className={`grid grid-cols-1 md:grid-cols-2 bg-zinc-400 p-2 bg-opacity-20 mb-4 items-baseline cursor-pointer hover:bg-opacity-30 transition-all ${
                        isSelected ? "border-l-4 border-teal-400" : ""
                     }`}
                     onClick={() => setSelectedProject(project)}
                  >
                     <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-white">{project.name}</h2>
                        <button
                           onClick={() => handleEditProject(project)}
                           className="text-teal-400 hover:text-teal-300 transition-colors"
                        >
                           <PencilIcon className="h-5 w-5" />
                        </button>
                        <DeleteProjectButton
                           project={project}
                           isSubmitting={navigation.state === "submitting"}
                           onDeleteComplete={loadProjects}
                        />
                     </div>
                     <p className="text-xs text-zinc-400 text-right">
                        Created: {new Date(project.createdAt).toLocaleString("es-CO", { timeZone: localTimeZone })}{" "}
                     </p>
                     <p className="md:col-span-2 text-white italic font-serif text-zinc-400">{project.description}</p>
                     <p>
                        Objetive: <span className="italic">{project.objective}</span>
                     </p>
                     <ProjectFiles className="md:col-span-2" files={project.files} projectId={project.id} />
                  </div>
               );
            })}

         <ProjectFormModal isOpen={isModalOpen} onClose={handleCloseModal} initialData={editingProject || undefined} />
      </div>
   );
}
