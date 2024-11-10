import { LinearClient } from "@linear/sdk";
import * as core from "@actions/core";

async function getLabels(client: LinearClient, labelNames: string[]) {
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
export async function addLabelToTicket(
  client: LinearClient,
  { ticketId, labelNames }: LabelTicketOptions
): Promise<void> {
  try {
    // Get the existing issue
    core.info(`Getting issue ${ticketId}...`);
    const issue = await client.issue(ticketId);
    if (!issue) {
      throw new Error(`Issue ${ticketId} not found`);
    }
    core.info(`Found issue ${issue.identifier}`);

    const prettyLabelNames = labelNames.join(", ");
    core.info(`Getting labels ${prettyLabelNames}...`);
    const issueLabels = await getLabels(client, labelNames);
    const labelIds = issueLabels.map((label) => {
      core.info(`Found label ${label.name}`);
      return label.id;
    });
    if (labelIds.length !== labelNames.length) {
      throw new Error(`Labels ${prettyLabelNames} not found`);
    }
    core.info(
      `Adding labels ${prettyLabelNames} to issue ${issue.identifier}...`
    );
    // Get current labels and combine with new ones
    const currentLabelIds = issue.labelIds || [];
    const uniqueLabelIds = [...new Set([...currentLabelIds, ...labelIds])];

    // Update the issue with new labels
    await issue.update({
      labelIds: uniqueLabelIds,
    });
    core.info(`Labels ${prettyLabelNames} added to issue ${issue.identifier}`);
  } catch (error) {
    throw new Error(`Failed to add labels to ticket`);
  }
}
