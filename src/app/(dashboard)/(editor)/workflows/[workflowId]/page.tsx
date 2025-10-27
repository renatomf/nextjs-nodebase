import { requireAuth } from "@/lib/auth-utils";

interface Props {
  params: Promise<{
    workflowId: string;
  }>
};

const Page = async ({ params }: Props) => {
  await requireAuth();
  const { workflowId }= await params;

  return ( 
    <div>
      Workflow ID: {workflowId}
    </div>
   );
}
 
export default Page;