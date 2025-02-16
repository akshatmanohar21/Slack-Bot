require('dotenv').config();
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { WebClient } = require('@slack/web-api');

const app = express();
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Test Express server config
app.post('/slack/command', async (req, res) => {
    res.status(200).send();
});

app.post('/slack/interactivity', async (req, res) => {
    res.status(200).send();
});

app.post('/slack/actions', async (req, res) => {
    res.status(200).send();
});

describe('Slack Bot API Endpoints', () => {
    
    // Test for Slack command
    it('should handle /slack/command', async () => {
        const res = await request(app)
            .post('/slack/command')
            .send({
                trigger_id: "test_trigger_id"
            });

        expect(res.status).toBe(200);
    });

    // Test for Slack interactivity
    it('should handle /slack/interactivity', async () => {
        const res = await request(app)
            .post('/slack/interactivity')
            .send({
                payload: JSON.stringify({ type: "view_submission", user: { id: "U123" } })
            });

        expect(res.status).toBe(200);
    });

    // Test for Slack actions (approval/rejection)
    it('should handle /slack/actions', async () => {
        const res = await request(app)
            .post('/slack/actions')
            .send({
                payload: JSON.stringify({
                    type: "block_actions",
                    user: { id: "U123" },
                    actions: [{ action_id: "approve" }],
                    message: { text: "<@U456> requested approval" }
                })
            });

        expect(res.status).toBe(200);
    });

});
