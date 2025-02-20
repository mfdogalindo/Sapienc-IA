import { database, storage } from '../firebase/firebase.server';
import { ref, set, push, get, update } from 'firebase/database';
import { deleteObject, ref as storageRef } from 'firebase/storage';
import { ProjectCreate, Project } from 'server/models';

export async function getProjects(): Promise<Project[]> {
   const snapshot = await get(ref(database, "projects"));
   if (!snapshot.exists()) {
      return [];
   }
   else {
      const projects = snapshot.val();
      return Object.keys(projects).map((key) => {
         const toReturn = { id: key, ...projects[key] };
         toReturn.files = Object.values(toReturn.files || {}
         ).filter((file) => file !== null && file !== undefined).map((file) => {
            return file;
         }
         );
         return toReturn;
      });
   }
}


export async function deleteProject(projectId: string) {
   try {
      // delete associated files from storage
      const projectDs = await get(ref(database, `projects/${projectId}`));

      if (!projectDs.exists()) {
         return;
      }

      const project: Project = projectDs.val();

      if (project.files) {
         const files = Object.values(project.files);
         for (const file of files) {
            const fileRef = storageRef(storage, file.url);
            await deleteObject(fileRef);
         }
      }

   } catch (e) {
      console.error(e);
   }

   // delete project from database
   await set(ref(database, `projects/${projectId}`), null);
}

export async function createProject(data: ProjectCreate): Promise<Project> {
   const projectRef = ref(database, `projects`);
   const newProjectRef = push(projectRef);
   const newProject = { id: newProjectRef.key, ...data, createdAt: Date.now(), updatedAt: Date.now() };
   await set(newProjectRef, newProject);
   return newProject as Project;
}

export async function updateProject(projectId: string, data: ProjectCreate) {
   const projectRef = ref(database, `projects/${projectId}`);
   const updates = {
      name: data.name,
      description: data.description,
      objective: data.objective,
      updatedAt: Date.now()
   };

   console.log(updates);

   await update(projectRef, updates);
}