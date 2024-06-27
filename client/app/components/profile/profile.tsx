"use client";
import { FC, useState } from "react";
import SideBarProfile from "./sidebarProfile";
import { useLogoutQuery } from "@/redux/features/auth/auth.api";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import ProfileInfo from "./ProfileInfo";
import ChangePassword from "./changePassword";

type Props = {
  user: any;
};

const Profile: FC<Props> = ({ user }) => {
  const [scroll, setScroll] = useState(false);

  const [avatar, setAvatar] = useState(null);
  const [logout, setLogout] = useState(false);
  const [courses, setCourses] = useState([]);
  //    const { data, isLoading } = useGetUsersAllCoursesQuery(undefined, {});

  const {} = useLogoutQuery(undefined, {
    skip: !logout ? true : false,
  });

  const [active, setActive] = useState(1);

  const logOutHandler = async () => {
    setLogout(true);
    await signOut();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 85) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    });
  }
  return (
    <div className="w-[85%] flex mx-auto">
      <div
        className={`w-[60px] 800px:w-[310px] h-[450px] dark:bg-slate-900 bg-opacity-90 border bg-white dark:border-[#ffffff1d] border-[#00000014] rounded-[5px] shadow-sm dark:shadow-sm mt-[80px] mb-[80px] sticky  left-[30px]  ${
          scroll ? "top-[120px]" : "top-[30px]"
        } `}
      >
        <SideBarProfile
          user={user}
          active={active}
          avatar={avatar}
          setActive={setActive}
          logOutHandler={logOutHandler}
        />
      </div>
      {active === 1 && (
        <div className="w-full h-full bg-transparent mt-[80px]">
          <ProfileInfo avatar={avatar} user={user} />
        </div>
      )}
      {active === 2 && (
        <div className="w-full h-full bg-transparent mt-[80px]">
          <ChangePassword />
        </div>
      )}

      {/*
      <div className="w-full pl-7 px-2 800px:px-10 800px:pl-8 mt-[80px]">
        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] 1500px:grid-cols-4 1500px:gap-[35px] mb-12 border-0">
          Courses
        </div>

        <h1 className="text-center text-[18px] font-Poppins dark:text-white text-black">
          You don&apos;t have any purchased courses!
        </h1>
      </div>  */}
    </div>
  );
};

export default Profile;
