import { useEffect, useRef } from "react";
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
import { Form, useNavigation } from "@remix-run/react";
import { Project } from "server/models";
import { TrashIcon } from "@heroicons/react/16/solid";

export default function DeleteProjectButton({
   project,
   isSubmitting,
   onDeleteComplete,
}: {
   project: Project;
   isSubmitting: boolean;
   onDeleteComplete: () => void;
}) {
   const formRef = useRef<HTMLFormElement>(null);
   const navigation = useNavigation();

   useEffect(() => {
      if (navigation.state === "idle" && formRef.current) {
         const form = formRef.current;
         const action = form.getAttribute("data-submitted");
         if (action === "delete") {
            form.removeAttribute("data-submitted");
            onDeleteComplete();
         }
      }
   }, [navigation.state, onDeleteComplete]);

   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      const form = e.currentTarget;
      form.setAttribute("data-submitted", "delete");
   };
   return (
      <AlertDialog>
         <AlertDialogTrigger asChild>
            <button className="text-red-500 hover:text-red-700 transition-colors">
               <TrashIcon className="h-5 w-5" />
            </button>
         </AlertDialogTrigger>
         <AlertDialogContent className="bg-zinc-900 border border-zinc-800">
            <AlertDialogHeader>
               <AlertDialogTitle className="text-white">Delete Project</AlertDialogTitle>
               <AlertDialogDescription className="text-zinc-400">
                  Are you sure you want to delete "{project.name}"? This action cannot be undone and will delete all
                  associated files and chats.
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel className="bg-zinc-800 text-white hover:bg-zinc-700">Cancel</AlertDialogCancel>
               <Form method="post" ref={formRef} onSubmit={handleSubmit}>
                  <input type="hidden" name="_action" value="delete" />
                  <input type="hidden" name="projectId" value={project.id} />
                  <AlertDialogAction
                     type="submit"
                     disabled={isSubmitting}
                     className="bg-red-600 text-white hover:bg-red-700"
                  >
                     {isSubmitting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
               </Form>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
