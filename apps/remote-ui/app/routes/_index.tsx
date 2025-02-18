import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { getUserSession } from "server/session.server";
import { useState } from "react";

export async function loader({ request }) {
  const user = await getUserSession(request);
  if (user) return redirect("/projects");
  return null;
}


export default function Index() {
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;

    // Codificar las credenciales en Base64
    const credentials = btoa(`${email}:${password}`);

    try {
      // Enviar la petición con el encabezado Authorization a la ruta /login
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/json", // Opcional según tu necesidad
        },
      });

      if (response.ok) {
        // Si la autenticación es exitosa, redirige al usuario
        window.location.href = "/projects";
      } else {
        const data = await response.json();
        setError(data.error || "Error en la autenticación");
      }
    } catch (err) {
      setError("Error en la petición");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-sky-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white bg-opacity-30 p-8  shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-100">
            Sign in to your account
          </h2>
        </div>
        <Form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="bg-white appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="bg-white appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>


          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Sign in
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}