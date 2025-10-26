import prisma from "@/lib/db";
import { inngest } from "./client";
import { success } from "zod";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // Fetching video
    await step.sleep("wait-a-moment", "5s");
    
    // Transcribing
    await step.sleep("wait-a-moment", "5s");

    // Sending transcriptions to AI
    await step.sleep("wait-a-moment", "5s");

    await step.run("create-workflow", () => {
      return prisma.workflow.create({
        data: {
          name: "workflow-from-inngest",
        },
      });
    });

    return { success: true, message: "Job queued" }
  },
);
