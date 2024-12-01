import React from "react";
import ApiDocs from "~/components/ApiDocs";
import Dashboard from "~/components/Dashboard";

const Page: React.FC = () => {
  return (
    <Dashboard>
      <ApiDocs />
    </Dashboard>
  )
};

export default Page;
