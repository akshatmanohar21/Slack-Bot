require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { WebClient } = require('@slack/web-api');

const app = express();
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Method for handling /approval-test command
app.post('/slack/command', async (req, res) => {
    const { trigger_id } = req.body;
    try {
        await slackClient.views.open({
            trigger_id,
            view: {
                type: 'modal',
                callback_id: 'approval_modal',
                title: { type: 'plain_text', text: 'Approval Request' },
                blocks: [
                    {
                        type: 'input',
                        block_id: 'approver_select',
                        label: { type: 'plain_text', text: 'Select Approver' },
                        element: { type: 'users_select', action_id: 'approver' }
                    },
                    {
                        type: 'input',
                        block_id: 'approval_text',
                        label: { type: 'plain_text', text: 'Approval Text' },
                        element: { type: 'plain_text_input', action_id: 'text' }
                    }
                ],
                submit: { type: 'plain_text', text: 'Submit' }
            }
        });
        res.status(200).send();
    } catch (error) {
        console.error("Error opening modal:", error);
        res.status(500).send('Failed to open modal');
    }
});

// Method for handling modal submission (user selects an approver)
app.post('/slack/interactivity', async (req, res) => {
    const payload = JSON.parse(req.body.payload);
    res.status(200).send();

    if (payload.type === "view_submission") {
        const requester = payload.user.id;
        const approver = payload.view.state.values.approver_select.approver.selected_user;
        const text = payload.view.state.values.approval_text.text.value;

        try {
            const dmResponse = await slackClient.conversations.open({ users: approver });
            if (!dmResponse.ok) return;

            const dmChannel = dmResponse.channel.id;

            await slackClient.chat.postMessage({
                channel: dmChannel,
                text: `<@${requester}> is asking for approval: "${text}"`,
                blocks: [
                    {
                        type: "section",
                        text: { type: "mrkdwn", text: `<@${requester}> is asking for approval: "${text}"` }
                    },
                    {
                        type: "actions",
                        block_id: "approval_action",
                        elements: [
                            { type: "button", text: { type: "plain_text", text: "Approve" }, style: "primary", action_id: "approve" },
                            { type: "button", text: { type: "plain_text", text: "Reject" }, style: "danger", action_id: "reject" }
                        ]
                    }
                ]
            });

        } catch (error) {
            console.error("Error sending approval request:", error);
        }
    }
});

// Method for handling approval or rejection actions
app.post('/slack/actions', async (req, res) => {
    res.status(200).send(); // Prevent Slack timeout

    const payload = JSON.parse(req.body.payload);
    const approver = payload.user.id;
    const action = payload.actions[0].action_id; // "approve" or "reject"

    // Method for extracting requester ID from the message text
    const requesterMatch = payload.message.text.match(/<@(.*?)>/);
    if (!requesterMatch) return;

    const requester = requesterMatch[1];
    const responseText = action === 'approve'
        ? `<@${approver}> approved it.`
        : `<@${approver}> rejected it.`;

    try {
        // Update the message in the approver's DM
        await slackClient.chat.update({
            channel: payload.channel.id,
            ts: payload.message.ts,
            text: responseText
        });

        // Notify the requester via DM
        const dmResponse = await slackClient.conversations.open({ users: requester });
        if (!dmResponse.ok) return;

        const dmChannel = dmResponse.channel.id;

        await slackClient.chat.postMessage({
            channel: dmChannel,
            text: `Hey <@${requester}>, your request was ${action === 'approve' ? 'approved' : 'rejected'} by <@${approver}>.`
        });

    } catch (error) {
        console.error("Error sending DM:", error);
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
