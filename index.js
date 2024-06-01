
import { getInput, setFailed } from '@actions/core';
import github from '@actions/github';
import { load } from 'js-yaml';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';

const schema = z.object({
  path: z.string(),
  branch: z.string(),
  only_changed: z.boolean().optional().default(true),
  with_branch_name: z.boolean().optional().default(true),
  with_timestamp: z.boolean().optional().default(true),
  with_commit_sha: z.boolean().optional().default(true),
});

async function main() {
  const token = getInput('token');
  const args = load(getInput('args'));
  const argObjs = []
  for (const arg of args) {
    argObjs.push(schema.parse(arg));
  }
  console.log(argObjs);

  const octokit = new Octokit({ auth: token });
  const { repository, sha } = github.context.payload;
  const commit = await octokit.repos.getCommit({
    owner: repository.owner.login,
    repo: repository.name,
    ref: sha,
  });

  const changedFiles = commit.data.files.map((file) => file.filename);
  console.log('sha:', sha);
  console.log(changedFiles);
}

try {
  await main();
} catch (error) {
  setFailed(error.message);
}

// try {
//   // `who-to-greet` input defined in action metadata file
//   const nameToGreet = core.getInput('who-to-greet');
//   console.log(`Hello ${nameToGreet}!`);
//   const time = (new Date()).toTimeString();
//   core.setOutput("time", time);
//   // Get the JSON webhook payload for the event that triggered the workflow
//   const payload = JSON.stringify(github.context.payload, undefined, 2)
//   console.log(`The event payload: ${payload}`);
// } catch (error) {
//   core.setFailed(error.message);
// }
