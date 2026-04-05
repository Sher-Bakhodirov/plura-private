import React from "react";
import Loading from "../ui/loading";

const LoadingPage: React.FC = () => {
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <Loading />
    </div>
  );
};

export default LoadingPage;
