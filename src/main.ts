import * as core from "@actions/core";
import * as github from "@actions/github";
import {Epic, parseParent, Subtask, updateEpics} from "./issues";

const EPIC = 'epic';
const SUBTASK = 'subtask';

async function run() {
    try {
        const token = core.getInput("TOKEN", { required: true });
        const octokit = github.getOctokit(token);

        console.log(`Fetching Epic issues with label [${EPIC}]`);
        const { data: epicIssues } = await octokit.issues.listForRepo({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            labels: EPIC,
            direction: 'asc',
        });

        console.log(`Fetching Subtask issues with label [${SUBTASK}]`);
        const { data: subtaskIssues } = await octokit.issues.listForRepo({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            state: 'all',
            labels: SUBTASK,
            direction: 'asc',
        });

        const epics: Epic[] = epicIssues.map(ei => ({
            number: ei.number,
            title: ei.title,
            body: ei.body,
            state: ei.state,
            subtasks: [],
        }));

        const subtasks: Subtask[] = subtaskIssues.map(si => ({
            number: si.number,
            title: si.title,
            body: si.body,
            state: si.state,
            parent: parseParent(si.body),
        }))
        const updated = updateEpics(epics, subtasks);

        if (updated.length > 0) {
            console.log('Updating Epics');
            updated.forEach(eu => {
                octokit.issues.update({
                    owner: github.context.repo.owner,
                    repo: github.context.repo.repo,
                    issue_number: eu.number,
                    body: eu.body,
                }).then(response => {
                    console.log(`Updated Epic #${response.data.number} ${response.data.title}`);
                }).catch(error => {
                    console.log(`Error Updating Epic #${eu.number}: ${error}`);
                });
            });
        } else {
            console.log('No Epic updates');
        }
    } catch (error) {
        core.error(error);
        core.setFailed(error.message);
    }
}

run();