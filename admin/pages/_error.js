import Link from "next/link";
import IntlMessages from "../util/IntlMessages";

const ErrorPage = () => {
  return (
    <div className="page-error-container">
      <div className="page-error-content">
        <h2 className="text-center">
          <IntlMessages id="app.error.pageNotFound" />
        </h2>
        <p className="text-center">
          <Link href="/">
            <a className="btn btn-primary">
              <IntlMessages id="app.error.goHome" />
            </a>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
