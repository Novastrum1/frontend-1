# Dependency security controls

Dependabot proposes updates for the ecosystems listed in .github/dependabot.yml. npm and Cargo version updates wait seven days; security updates are not delayed by that cooldown. Updates require review and passing checks; no automatic merge is configured here.

## Checks

- **Dependency review** rejects newly introduced moderate-or-higher advisories in pull requests, across runtime, development and unknown scopes. It does not scan for all malicious code.
- **Installed dependency audit** runs on pull requests, main pushes and daily schedules. It installs from lockfiles with lifecycle scripts disabled and fails for moderate-or-higher npm advisories, including development dependencies. Registry failures also fail the check.
- GitHub Actions are pinned to full commit IDs. Dependabot tracks those references; review upstream diffs before accepting updates. Checkout credentials are not persisted for dependency code to read.
- Existing RustSec checks remain in force where present. Known unresolved advisories are not made safe by this change; consult the repository's dependency-security records.

## Repository settings required for enforcement

After merging the workflow, enable the dependency graph, Dependabot alerts and Dependabot security updates in GitHub Settings → Advanced Security. Configure a main-branch ruleset requiring **Dependency review** and **Installed dependency audit** to pass, require pull requests and block force pushes. Confirm any existing required checks and bypass permissions before changing rules. Workflow files alone do not prevent an administrator or an unprotected branch from merging a failing check.

These settings were not enabled or verified by this change. The available GitHub connector does not expose their administration, and local GitHub CLI authentication was unavailable. They must be completed by an authenticated repository administrator.

## Response to an alert

Inspect the advisory, affected lockfile and dependency path. Upgrade to a compatible fixed version and run the repository's tests/build. Preserve upstream notices. Do not add ignores, weaken severity thresholds or use continue-on-error merely to obtain a passing badge. Review any exception separately, including justification, affected scope, owner and expiration.

No dependency scanner guarantees protection against new malware, compromised maintainers, malicious install/build scripts, or harmful application code. Keep credentials out of untrusted workflows and review lockfile, workflow and source changes.
