# Slack Bot

## Overview
This Slack bot automates approval requests within a workspace. Users can request approvals using a Slack slash command (`/approval-test`), and the selected approver receives a **direct message (DM)** to approve or reject the request. Once approved or rejected, the requester is notified via DM.

## Features
- **Slash Command (`/approval-test`)**: Opens a modal where the user selects an approver and enters an approval request.
- **Direct Messages (DMs)**: The selected approver receives a DM with "Approve" and "Reject" buttons.
- **Action Handling**: When the approver takes an action, the requester is notified via DM.
- **Unit Testing**: Jest-based tests ensure API endpoints function correctly.
- **Architecture Diagram**: A visual representation of the bot’s workflow.

---

## Architecture Diagram
The architecture diagram is created using eraser.io  

![Alt Text](https://github.com/akshatmanohar21/Slack-Bot/blob/main/architecture_diagram.png)



