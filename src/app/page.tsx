import prisma from "@/lib/db";

const Page = async () => {
  const users  = await prisma.user.findMany();

  return (
    <div className="flex justify-center items-center min-h-screen min-w-screen">
      {JSON.stringify(users)}
    </div>
  );
};

export default Page;
