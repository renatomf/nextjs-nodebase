import Handlebars from "handlebars";
import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { discordChannel } from "@/inngest/channels/discord";
import { decode } from "html-entities";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(jsonString);
});

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(discordChannel().status({ nodeId, status: "loading" }));

  if (!data.content) {
    await publish(discordChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Discord node: Message content is missing");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent || "Mensagem vazia");

  let username: string | undefined = undefined;
  if (data.username) {
    username = decode(Handlebars.compile(data.username)(context));
    // Remover a palavra "discord" do username para não gerar erro 400
    username = username.replace(/discord/gi, "bot").trim();
    if (username.length === 0) username = undefined;
  }

  try {
    const result = await step.run("discord-webhook", async () => {
      if (!data.webhookUrl) {
        await publish(discordChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Discord node: Webhook URL is required");
      }

      console.log("🔵 DISCORD WEBHOOK PAYLOAD >>>", {
        content: content.slice(0, 2000),
        username,
        url: data.webhookUrl,
        context,
      });

      try {
        await ky.post(data.webhookUrl, {
          json: {
            content: content.slice(0, 2000),
            username,
          },
        });
      } catch (err: any) {
        throw new NonRetriableError(
          `Discord node: Failed to send webhook. ${err?.message || err}`
        );
      }

      if (!data.variableName) {
        await publish(discordChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Discord node: Variable name is missing");
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await publish(discordChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(discordChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
