import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import "firebase/compat/firestore";
import CoordinatorDashBoard from "./CoordinatorDashBoard";
import SideNav from "./SideNav";
import TopNavBar from "./TopNavbar";
import React, { useEffect, useState } from "react";


const MainPage: React.FC = () => {

  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (User) => {
      setAuthUser(User);
    });

    return () => unsubscribe();
  }, []);


  return (
    <>
      <div>
        <TopNavBar authUser={authUser} />
        <div className="flex">
          <SideNav isOpen={false} />
          <CoordinatorDashBoard />
        </div>
      </div>
    </>
  );
};

export default MainPage;
