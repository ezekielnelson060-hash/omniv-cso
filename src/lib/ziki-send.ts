/** Shared Ziki send helpers — keep chat-panel thinner. */

export type ZikiAction = {
  type: string;
  label: string;
  city?: string;
  title?: string;
  id?: string;
};

export async function fetchZikiReply(input: {
  message: string;
  history: string;
  context: string;
  attachments?: {
    name: string;
    mimeType: string;
    data?: string;
    fileUri?: string;
  }[];
}): Promise<{ text: string; actions: ZikiAction[] }> {
  const res = await fetch("/api/ziki", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: input.message,
      history: input.history,
      context: input.context,
      attachments: input.attachments?.length ? input.attachments : undefined,
    }),
  });
  const data = (await res.json()) as {
    text?: string;
    actions?: ZikiAction[];
  };
  return {
    text:
      data.text ||
      "Ziki could not reach the model. Check API keys, then retry.",
    actions: Array.isArray(data.actions) ? data.actions : [],
  };
}
