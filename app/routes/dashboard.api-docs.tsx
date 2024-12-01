import React from "react";
import ApiDocs from "~/components/ApiDocs";
import DashboardLayout from "~/components/Dashboard/DashboardLayout";

const Page: React.FC = () => {
  return (
    <DashboardLayout>
      <ApiDocs />
    </DashboardLayout>
  )
};

export default Page;
