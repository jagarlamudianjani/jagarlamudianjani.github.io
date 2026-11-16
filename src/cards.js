// Mock visuals for the work cards. Her real screens are private, so each card
// draws a small, honest picture of the kind of work instead of a screenshot.

const rows = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join("");

const ART = {
  // a test run: suite list with pass ticks and a run time
  runner: () => `
    <div class="art runner">
      <div class="art-bar"><span>XR.UI.Tests</span><span class="ok">● 200+ passed</span><span>60:00</span></div>
      ${rows(7, i => `<div class="run-row" style="--i:${i}"><i class="tick"></i><span>${["Estimate_PricingTotals", "Contents_Quantities", "PDF_Conversion", "Xactimate_Sync", "xactAi_Import", "Totals_Accuracy", "Regression_Core"][i]}</span><em>${[3.2, 2.7, 4.1, 2.2, 3.8, 1.9, 5.4][i]}s</em></div>`)}
      <div class="run-meter"><i style="width:75%"></i></div>
    </div>`,
  // a PR with its pre-merge checks
  checks: () => `
    <div class="art checks">
      <div class="art-bar"><span>PR · XR work item</span><span class="ok">Ready to merge</span></div>
      ${rows(5, i => `<div class="check" style="--i:${i}"><i class="tick"></i><b>${["Functional", "Regression", "Exploratory", "Edge cases", "UI automation"][i]}</b><span>passed</span></div>`)}
      <div class="week mono">${rows(5, i => `<span style="--i:${i};height:${[62, 80, 70, 90, 76][i]}%"></span>`)}</div>
    </div>`,
  // Jira card flowing to a PR through the agent
  agent: () => `
    <ol class="art agent">
      ${["Jira card", "Analysis", "UI checks", "Code change", "PR opened", "Status update"].map((s, i) => `<li class="node${i === 4 ? " hot" : ""}" style="--i:${i}"><i>${String(i + 1).padStart(2, "0")}</i>${s}</li>`).join("")}
    </ol>`,
  // pipeline stages
  pipeline: () => `
    <div class="art pipeline">
      <div class="art-bar"><span>monorepo · PR-triggered</span><span class="ok">● succeeded</span></div>
      <div class="stages">${["Build", "Unit", "UI tests", "Report"].map((s, i) => `<div class="stage-chip" style="--i:${i}"><i class="tick"></i>${s}</div>`).join('<span class="dash"></span>')}</div>
      <div class="art-bar dim"><span>nightly · scheduled</span><span class="ok">● succeeded</span></div>
      <div class="stages">${["Build", "Regression", "Logs", "Results"].map((s, i) => `<div class="stage-chip" style="--i:${i}"><i class="tick"></i>${s}</div>`).join('<span class="dash"></span>')}</div>
    </div>`,
  // framework folder layout
  tree: () => `
    <div class="art tree mono">
      <p style="--i:0">playwright/</p>
      <p class="in" style="--i:1">pages/ <em>Page Objects</em></p>
      <p class="in2" style="--i:2">BasePage.ts</p><p class="in2" style="--i:3">FeaturePage.ts</p>
      <p class="in" style="--i:4">specs/ <em>test files</em></p>
      <p class="in2" style="--i:5">feature.spec.ts</p><p class="in2" style="--i:6">regression.spec.ts</p>
      <p class="in" style="--i:7">fixtures/</p>
      <p style="--i:8">playwright.config.ts</p>
    </div>`,
  // manual vs automation split
  split: () => `
    <div class="art split">
      <div class="split-bar"><span style="--i:0;flex:60">Manual 60%</span><span style="--i:1;flex:40">Automation 40%</span></div>
      <div class="modules mono">${["QMS", "BD", "L&D", "Agile", "R&D", "HR", "Events", "Projects", "Work", "Tickets"].map((m, i) => `<span style="--i:${i}">${m}</span>`).join("")}</div>
    </div>`,
};

export const drawArt = kind => (ART[kind] || (() => ""))();
