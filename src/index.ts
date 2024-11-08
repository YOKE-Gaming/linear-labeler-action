import { LinearClient } from "@linear/sdk";
import * as core from "@actions/core";
export async function getLabels(client: LinearClient, labelNames: string[]) {
  try {
    const labels = await client.issueLabels({
      filter: {
        name: {
          in: labelNames,
        },
      },
    });
    return labels.nodes;
  } catch (error) {
    throw new Error(`Failed to get label ${labelNames}`);
  }
}

interface LabelTicketOptions {
  ticketId: string;
  labelNames: string[];
}
export async function addLabelToTicket(client: LinearClient, {
  ticketId,
  labelNames,
}: LabelTicketOptions): Promise<void> {
  try {
    // Get the existing issue
    console.log(`Getting issue ${ticketId}...`);
    const issue = await client.issue(ticketId);
    if (!issue) {
      throw new Error(`Issue ${ticketId} not found`);
    }
    console.log(`Found issue ${issue.identifier}`);

    const prettyLabelNames = labelNames.join(", ");
    console.log(`Getting labels ${prettyLabelNames}...`);
    const issueLabels = await getLabels(client, labelNames);
    const labelIds = issueLabels.map((label) => {
      console.log(`Found label ${label.name}`);
      return label.id;
    });
    if (labelIds.length !== labelNames.length) {
      throw new Error(`Labels ${prettyLabelNames} not found`);
    }
    console.log(
      `Adding labels ${prettyLabelNames} to issue ${issue.identifier}...`
    );
    // Get current labels and combine with new ones
    const currentLabelIds = issue.labelIds || [];
    const uniqueLabelIds = [...new Set([...currentLabelIds, ...labelIds])];

    // Update the issue with new labels
    await issue.update({
      labelIds: uniqueLabelIds,
    });
    console.log(
      `Labels ${prettyLabelNames} added to issue ${issue.identifier}`
    );
  } catch (error) {
    throw new Error(`Failed to add labels to ticket`);
  }
}

(async () => {
  const linearApiKey = core.getInput("linearApiKey");
  const branchName = core.getInput("branchName");
  const commaSeparatedLabelNames = core.getInput("labelNames");
  if (!linearApiKey || !branchName || !commaSeparatedLabelNames) {
    throw new Error("Linear API key, branch name, and label names are required");
  }

  const client = new LinearClient({ apiKey: linearApiKey });

  // Extract ticket ID from branch name (e.g. "nc-123" from "nc-123-abcd")
  const ticketIdMatch = RegExp(/^([a-zA-Z]+-\d+)/).exec(branchName);
  if (!ticketIdMatch) {
    throw new Error(`Could not extract ticket ID from branch name: ${branchName}`);
  }

  console.log(`Branch name: ${branchName}`);
  const ticketId = ticketIdMatch[1].toUpperCase();
  const labelNames = commaSeparatedLabelNames.split(",");
  await addLabelToTicket(client, { ticketId, labelNames });
})();
