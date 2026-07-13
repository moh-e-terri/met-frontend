import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { formatDocumentTitle, getPageTitle } from "./pageTitles";

export const DocumentTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = formatDocumentTitle(getPageTitle(pathname));
  }, [pathname]);

  return null;
};
