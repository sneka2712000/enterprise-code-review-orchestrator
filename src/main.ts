import * as dotenv from 'dotenv';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { CodeReviewOrchestrator } from './orchestrator.js';
import { ReportGenerator } from './utils/report-generator.js';

dotenv.config();

function printUsage(): void {
  console.error(
    'Usage: npm start <owner> <repo> <pr-number>'
  );
}

function validateArguments(
  owner: string | undefined,
  repo: string | undefined,
  prStr: string | undefined
): number {
  if (!owner || !repo || !prStr) {
    printUsage();
    throw new Error('Missing required arguments.');
  }

  const prNumber = Number(prStr);

  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    throw new Error('Pull request number must be a positive integer.');
  }

  return prNumber;
}

function validateAuthentication(): void {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error(
      'GITHUB_TOKEN is required for GitHub MCP access.'
    );
  }

  const hasAnthropicApiKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasAwsCredentials =
    Boolean(process.env.AWS_ACCESS_KEY_ID) &&
    Boolean(process.env.AWS_SECRET_ACCESS_KEY);

  if (hasAwsCredentials) {
    if (!process.env.AWS_REGION) {
      throw new Error(
        'AWS authentication is configured, but AWS_REGION is missing.'
      );
    }

    console.log('🔐 Using AWS Bedrock authentication');
    return;
  }

  if (hasAnthropicApiKey) {
    console.log('🔐 Using Anthropic API authentication');
    return;
  }

  throw new Error(
    'No authentication configured. Set ANTHROPIC_API_KEY for Anthropic API, ' +
      'or set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION for AWS Bedrock.'
  );
}

function validateModel(): string {
  const model = process.env.ANTHROPIC_MODEL;

  if (!model) {
    throw new Error(
      'ANTHROPIC_MODEL is required. Example: claude-sonnet-4-5-20250929'
    );
  }

  return model;
}

async function main(): Promise<void> {
  const [owner, repo, prStr] = process.argv.slice(2);

  try {
    const prNumber = validateArguments(owner, repo, prStr);

    validateAuthentication();
    const model = validateModel();

    console.log(
      `🔎 Reviewing ${owner}/${repo} pull request #${prNumber}...`
    );

    const orchestrator = new CodeReviewOrchestrator({ model });

    const report = await orchestrator.reviewPullRequest(
      owner!,
      repo!,
      prNumber
    );

    const reportGenerator = new ReportGenerator();

    const reportsDirectory = path.resolve(process.cwd(), 'reports');
    await mkdir(reportsDirectory, { recursive: true });

    const baseName = `${owner}_${repo}_${prNumber}`;

    const jsonPath = path.join(reportsDirectory, `${baseName}.json`);
    const markdownPath = path.join(reportsDirectory, `${baseName}.md`);
    const htmlPath = path.join(reportsDirectory, `${baseName}.html`);

    await writeFile(
      jsonPath,
      reportGenerator.generateJSONReport(report),
      'utf8'
    );

    await writeFile(
      markdownPath,
      reportGenerator.generateMarkdownReport(report),
      'utf8'
    );

    await writeFile(
      htmlPath,
      reportGenerator.generateHTMLReport(report),
      'utf8'
    );

    console.log('\n✅ Review completed successfully.');
    console.log(`📄 JSON:     ${jsonPath}`);
    console.log(`📝 Markdown: ${markdownPath}`);
    console.log(`🌐 HTML:     ${htmlPath}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error(`\n❌ ${message}`);
    process.exitCode = 1;
  }
}

void main();
