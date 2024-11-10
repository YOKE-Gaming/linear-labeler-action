import { LinearClient } from "@linear/sdk";
import * as core from "@actions/core";
import { addLabelToTicket } from "./utils";

export async function run() {
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
  
  core.info(`Branch name: ${branchName}`);
  const ticketId = ticketIdMatch[0].toUpperCase();
  const labelNames = commaSeparatedLabelNames.split(",");
  await addLabelToTicket(client, { ticketId, labelNames });
}

run();
