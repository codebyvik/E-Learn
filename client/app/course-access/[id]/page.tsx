"use client";
import CourseContent from "@/app/components/Courses/courseContent";
import Loader from "@/app/components/Loader/Loader";
import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
  params: any;
};

const Page = ({ params }: Props) => {
  const id = params.id;
  const { isLoading, error, data, refetch } = useLoadUserQuery(undefined, {});

  useEffect(() => {
    if (data) {
      const isPurchased = data.user.courses.find((item: any) => item._id === id);
      if (!isPurchased) {
        redirect("/");
      }
    }
    if (error) {
      console.log({ error });

      redirect("/");
    }
  }, [data, error]);

  return (
    <>{isLoading ? <Loader /> : <div>{data && <CourseContent id={id} user={data.user} />}</div>}</>
  );
};

export default Page;
