
export default function LoadingBar({className}: {className?: string}) {
   return (
         <div className={`fixed w-full h-1 z-50 ${className}`}>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-teal-500 to-indigo-500">
            <div className="absolute top-0 left-0 w-full h-full animate-shimmer bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>
        </div>
   );
}