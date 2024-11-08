"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLabelToTicket = exports.getLabels = void 0;
const sdk_1 = require("@linear/sdk");
const core = __importStar(require("@actions/core"));
async function getLabels(client, labelNames) {
    try {
        const labels = await client.issueLabels({
            filter: {
                name: {
                    in: labelNames,
                },
            },
        });
        return labels.nodes;
    }
    catch (error) {
        throw new Error(`Failed to get label ${labelNames}`);
    }
}
exports.getLabels = getLabels;
async function addLabelToTicket(client, { ticketId, labelNames, }) {
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
        console.log(`Adding labels ${prettyLabelNames} to issue ${issue.identifier}...`);
        // Get current labels and combine with new ones
        const currentLabelIds = issue.labelIds || [];
        const uniqueLabelIds = [...new Set([...currentLabelIds, ...labelIds])];
        // Update the issue with new labels
        await issue.update({
            labelIds: uniqueLabelIds,
        });
        console.log(`Labels ${prettyLabelNames} added to issue ${issue.identifier}`);
    }
    catch (error) {
        throw new Error(`Failed to add labels to ticket`);
    }
}
exports.addLabelToTicket = addLabelToTicket;
(async () => {
    const linearApiKey = core.getInput("linearApiKey");
    const branchName = core.getInput("branchName");
    const commaSeparatedLabelNames = core.getInput("labelNames");
    if (!linearApiKey || !branchName || !commaSeparatedLabelNames) {
        throw new Error("Linear API key, branch name, and label names are required");
    }
    const client = new sdk_1.LinearClient({ apiKey: linearApiKey });
    const ticketIdMatch = RegExp(/\(([^)]+)\)/).exec(branchName);
    if (!ticketIdMatch) {
        throw new Error(`Could not find ticket ID in branch name: ${branchName}`);
    }
    console.log(`Branch name: ${branchName}`);
    const ticketId = ticketIdMatch[1].toUpperCase();
    const labelNames = commaSeparatedLabelNames.split(",");
    await addLabelToTicket(client, { ticketId, labelNames });
})();
