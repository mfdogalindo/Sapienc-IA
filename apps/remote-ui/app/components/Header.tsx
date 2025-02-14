export default function Header() {

   const handleLogout = async () => { 
      await fetch("/logout", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
      });
   }

   return(
      <header className="sticky top-0 bg-zinc-800 p-4 shadow-md flex items-center justify-between">
         Soy un header rancio que no quiere correr en el servidor
         <div>
            <button onClick={handleLogout} className="btn btn-primary">Logout</button>
         </div>
      </header>
   )
}