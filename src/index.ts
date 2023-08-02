import { context } from "@actions/github"
import { setFailed } from "@actions/core"
import { coreLog, getClient, getMessage, reproductionLabel } from "./utils"

async function main() {
  try {
    const {
      repo,
      payload: {
        issue,
        pull_request: pullRequest,
        label: { name: newLabel }
      }
    } = context

    if (pullRequest || !issue?.body) return coreLog("Not an issue or has no body.")

    const labels = issue.labels.map((l: any) => l.name) as string[]

    if (![reproductionLabel].includes(newLabel) && !labels.includes(reproductionLabel))
      return coreLog("Not manually labeled or already labeled.")

    const client = getClient()
    const issueCommon = { ...repo, issue_number: issue.number }

    if (newLabel === reproductionLabel) {
      await client.issues.createComment({ ...issueCommon, body: getMessage() })
      return coreLog("Commented on issue, because it did not have a sufficient reproduction.")
    }
  }
  catch (error) {
    setFailed(error instanceof Error ? error.message : "Unknown error")
  }
}

main()
