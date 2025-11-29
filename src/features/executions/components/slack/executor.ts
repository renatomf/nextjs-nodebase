import Handlebars from "handlebars";
import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";

import { decode } from "html-entities";
import ky from "ky";
import { slackChannel } from "@/inngest/channels/slack";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(jsonString);
});

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(slackChannel().status({ nodeId, status: "loading" }));

  if (!data.content) {
    await publish(slackChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Slack node: Message content is missing");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent || "Mensagem vazia");

  try {
    const result = await step.run("slack-webhook", async () => {
      if (!data.webhookUrl) {
        await publish(slackChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Slack node: Webhook URL is required");
      }

      console.log("🔵 DISCORD WEBHOOK PAYLOAD >>>", {
        content: content.slice(0, 2000),
        url: data.webhookUrl,
        context,
      });

      try {
        await ky.post(data.webhookUrl, {
          json: {
            content: content,
          },
        });
      } catch (err: any) {
        throw new NonRetriableError(
          `Slack node: Failed to send webhook. ${err?.message || err}`
        );
      }

      if (!data.variableName) {
        await publish(slackChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Slack node: Variable name is missing");
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await publish(slackChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(slackChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
