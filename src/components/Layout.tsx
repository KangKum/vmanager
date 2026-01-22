import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="h-screen">
      <Header />
      <main className="h-[94%]">
        <Outlet />
      </main>
    </div>
  );
};
export default Layout;
