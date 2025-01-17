
'use strict';
const message = process.argv[3];
const fs = require('fs');

const types = [
    'build',
    "chore",
    'ci',
    'docs',
    'feat',
    'fix',
    'perf',
    'refactor',
    "release",
    'revert',
    'style',
    'test'
];

const scopes = [
    "scripts",
    "showcase",
    "packaging",
    "changelog",
    "schematics",
    "module:*"
];

function parseMessage(message) {
    const PATTERN = /^(\w+)(?:\(([^)]+)\))?\: (.+)$/;
    const match = PATTERN.exec(message);
    if (!match) {
        return null;
    }
    return {
        type: match[1] || null,
        scope: match[2] || null,
    }
}

function getScopesRule() {
    const messages = fs.readFileSync(message, {encoding: 'utf-8'});
    const parsed = parseMessage(messages.split('\n')[0]);
    if (!parsed) {
        return [2, 'always', scopes]
    }
    const { scope, type } = parsed;
    if (scope && !scopes.includes(scope) && type !== 'release' && !/module:.+/.test(scope)) {
        return [2, 'always', scopes]
    } else {
        return [2, 'always', []]
    }
}

function validateJiraId() {
    const messages = fs.readFileSync(message, {encoding: 'utf-8'});
    const [, body, footer] = messages.split("\n\n");
    const jiraIds = (footer || body || "").match(/[A-Z]+-[0-9]+/g);
    const isRuleValid =  jiraIds && jiraIds.length > 0;
    return [
        isRuleValid,
        'the commit message must provide minimum one valid jira id in the body or footer',
    ]
}

module.exports = {
    extends: ['@commitlint/config-angular', 'jira'],
    rules: {
        'type-enum': [2, 'always', types],
        'scope-enum': getScopesRule,
        'jira-task-id-empty': [2, 'always'],
        'jira-task-id-case': [0],
        'jira-commit-status-case': [0],
        'jira-task-id-max-length': [0],
        'jira-task-id-separator': [0]
    },
    plugins: [
        'commitlint-plugin-jira-rules',
        {
            rules: {
                'jira-task-id-empty': () => {
                    return validateJiraId();
                },
            },
        },
    ]
};
