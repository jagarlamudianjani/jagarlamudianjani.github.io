// Everything on the page that comes from the resume lives here, so edits to
// wording or numbers never touch layout code.

export const TOOLS = [
  "Selenium WebDriver", "Playwright", "C#", ".NET", "NUnit", "TypeScript", "Azure DevOps",
  "Page Object Model", "Pre-merge testing", "Regression", "Jira", "Playwright Trace Viewer", "Hyderabad",
];

export const CAPABILITIES = [
  { name: "Automation", text: "Selenium and Playwright suites in C# and TypeScript that run on every PR", tags: ["Selenium", "Playwright", "NUnit", ".NET", "Page Objects"] },
  { name: "Pipelines", text: "Daily and PR-triggered Azure DevOps runs; logs read, failures chased, breakages caught before merge", tags: ["Azure DevOps", "CI/CD", "Git", "Code review"] },
  { name: "Validation", text: "Every work item checked before it merges: functional, regression, exploratory, edge cases", tags: ["Functional", "Regression", "Exploratory", "Production sanity"] },
  { name: "AI QA", text: "A VS Code agent that reads a Jira card, checks the UI, changes code and opens the PR", tags: ["VS Code agent", "Jira", "AI-assisted QA"] },
];

// `art` picks the mock visual drawn on the card (see cards.js)
export const WORK = [
  {
    id: "xr-suite", art: "runner",
    title: "XactRestore UI suite", kind: "Selenium · C# · NUnit",
    org: "Verisk · XactRestore (XR)", when: "Feb 2026 – present",
    points: [
      "Develop and maintain **200+ automated UI test cases** and scenarios with Selenium WebDriver, C#, .NET and NUnit across critical XactRestore workflows",
      "Cut core regression execution from **80 to 60 minutes**, a 25% reduction, through NUnit categorization and execution optimization",
      "Stabilized **20–30 flaky automated tests** through better synchronization, locator reliability, test-data handling and root-cause analysis",
      "Support quality engineering across **8 major epics**, validating XR, Xactimate, PDF and xactAi integrations for pricing, quantities, totals and conversion accuracy",
    ],
  },
  {
    id: "pre-merge", art: "checks",
    title: "Pre-merge validation", kind: "Pre-merge · Regression · Exploratory",
    org: "Verisk · XactRestore (XR)", when: "Feb 2026 – present",
    points: [
      "Validate **10–13 work items per week** through pre-merge, functional, regression, exploratory and edge-case testing",
      "In a representative month, validated **35 work items**, including **28 pre-merge cards (~80%)**; raised 15 validation subtasks, reported 9 defects and contributed 2 automation PRs",
      "Automate repeatable scenarios once they are stable",
    ],
  },
  {
    id: "jira-agent", art: "agent",
    title: "Jira-to-PR AI agent", kind: "VS Code agent · AI-assisted QA",
    org: "Verisk · XactRestore (XR)", when: "2026",
    points: [
      "Built an **AI-assisted Jira-to-PR workflow** and a custom VS Code agent for XR pre-merge UI validation",
      "The agent supports analysis, UI checks, code changes, PR creation and status updates",
    ],
  },
  {
    id: "pipelines", art: "pipeline",
    title: "Azure DevOps pipelines", kind: "CI/CD · Monorepo",
    org: "Verisk", when: "2025 – present",
    points: [
      "Monitor daily scheduled and PR-triggered Azure DevOps pipelines in a monorepo, analyzing logs and test results to catch application breakages before merge",
      "Set up and maintained Azure DevOps CI/CD pipelines from scratch for XO, resolving failures to enable stable continuous testing and safer releases with AI assistance",
      "Contribute to **7–10 automation PRs per month** through implementation, peer review, pipeline verification and review-comment resolution",
    ],
  },
  {
    id: "playwright", art: "tree",
    title: "Playwright framework", kind: "Playwright · TypeScript",
    org: "Verisk · XO & Contents Track", when: "Jun 2025 – Jan 2026",
    points: [
      "Owned end-to-end quality for business-critical, multi-system applications: **XOR, XOW, XOA, XCOR, XCOW and CTO**",
      "Developed and maintained **50+ Playwright tests** in TypeScript over 6 months for functional and regression coverage",
      "Architected and evolved the framework with coding standards, reusable Page Objects and a clear split between page and spec files",
      "Validated about **4 feature scenarios per sprint**, plus post-deployment validation and production sanity testing across integrated systems",
      "Optimized execution by removing unnecessary waits, cutting redundant navigation and improving synchronization",
    ],
  },
  {
    id: "tf-apps", art: "split",
    title: "TF Apps QA", kind: "Manual + Selenium",
    org: "Technoflair Solutions", when: "Jun 2022 – Jun 2025",
    points: [
      "Tested TF Apps, an internal enterprise platform covering QMS, Business Development, L&D, Agile processes, R&D, HR, events, project tracking, work management and ticketing",
      "Delivered testing through a **60% manual and 40% automation** approach: functional and exploratory testing for complex workflows, Selenium health checks for repeatable paths",
      "Documented defects with reproducible evidence, verified fixes and ran regression testing",
      "Built Selenium WebDriver automation in C# and NUnit with reusable Page Object Model components for smoke and application-health checks",
    ],
  },
];

// `needle` is the gauge position, 0–1. `from`/`to` animate a count; `show` is printed as is
export const METRICS = [
  { name: "UI test suite", label: "Automated UI tests, maintained", from: 0, to: 250, suffix: "+", needle: 0.86 },
  { name: "Core regression", label: "Minutes per run, before → after", from: 80, to: 60, prefix: "80 → ", needle: 0.58 },
  { name: "Pre-merge share", label: "28 of 35 items in a month", from: 0, to: 80, prefix: "~", suffix: "%", needle: 0.8 },
  { name: "Weekly validation", label: "Work items per week", show: "10–13", needle: 0.44 },
  { name: "Flaky tests", label: "Stabilized for good", show: "20–30", needle: 0.3 },
  { name: "Automation PRs", label: "Written or reviewed, per month", show: "7–10", needle: 0.52 },
];

export const EXPERIENCE = [
  { org: "Verisk · XactRestore (XR)", role: "Software Development Engineer in Test (SDET I) · Hyderabad", when: "Feb 2026 to present" },
  { org: "Verisk · XO & Contents Track", role: "Software Development Engineer in Test (SDET I) · Hyderabad", when: "Jun 2025 to Jan 2026" },
  { org: "Technoflair Solutions", role: "QA Engineer · Hyderabad", when: "Jun 2022 to Jun 2025" },
];

// left empty until the details arrive; the column only renders when this has entries
export const EDUCATION = [];

export const EXTRAS = [
  { label: "Recognition", title: "Pat on the Back (POB) Award", text: "Verisk" },
  { label: "Languages", title: "English · Telugu · Hindi", text: "" },
];

export const CONTACT = {
  email: "Jagarlamudi.Anjani@gmail.com",
  links: [{ label: "GitHub", href: "https://github.com/jagarlamudianjani" }],
};
