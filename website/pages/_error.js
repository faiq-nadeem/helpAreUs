import Link from "next/link";

const ErrorPage = () => {
   return (
      <div className="page-error-container">
         <div className="page-error-content">
            <h2 className="text-center">Page Not Found</h2>
            <p className="text-center">
               <Link href="/">
                  <a className="btn btn-primary">Go home</a>
               </Link>
            </p>
         </div>
      </div>
   );
};

export default ErrorPage;
