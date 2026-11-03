import { spawnSync } from "node:child_process";
import { mkdtempSync, cpSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const root = process.cwd();
function run(command, args, cwd = root, capture = false) {
  const p = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
  });
  if (p.status !== 0)
    throw new Error(`${command} failed: ${capture ? p.stderr : p.status}`);
  return p.stdout?.trim();
}
if (run("git", ["status", "--porcelain"], root, true))
  throw new Error("Commit the reviewed source before publishing.");
const remote = run("git", ["remote", "get-url", "origin"], root, true);
const sha = run("git", ["rev-parse", "HEAD"], root, true);
run("npm", ["test"]);
run("npm", ["run", "build"]);
const stage = mkdtempSync(join(tmpdir(), "taste-align-pages-"));
try {
  run("git", ["init", "-b", "gh-pages"], stage);
  run(
    "git",
    [
      "config",
      "user.name",
      run("git", ["config", "user.name"], root, true) ||
        "Taste Align contributors",
    ],
    stage,
  );
  run(
    "git",
    [
      "config",
      "user.email",
      run("git", ["config", "user.email"], root, true) || "noreply@localhost",
    ],
    stage,
  );
  run("git", ["remote", "add", "origin", remote], stage);
  const exists = run(
    "git",
    ["ls-remote", "--heads", remote, "gh-pages"],
    root,
    true,
  );
  if (exists) {
    run("git", ["fetch", "origin", "gh-pages", "--depth", "1"], stage);
    run("git", ["reset", "--hard", "FETCH_HEAD"], stage);
    run("git", ["rm", "-rf", "--ignore-unmatch", "."], stage);
  }
  cpSync(join(root, "dist"), stage, { recursive: true });
  writeFileSync(join(stage, ".nojekyll"), "");
  writeFileSync(
    join(stage, "release.json"),
    JSON.stringify(
      { version: "0.1.0", commit: sha, builtAt: new Date().toISOString() },
      null,
      2,
    ),
  );
  run("git", ["add", "."], stage);
  run("git", ["commit", "-m", `Publish ${sha.slice(0, 7)}`], stage);
  run("git", ["push", "origin", "HEAD:gh-pages"], stage);
  console.log(
    `Published static branch from ${sha}. GitHub Pages must use gh-pages /.`,
  );
} finally {
  rmSync(stage, { recursive: true, force: true });
}
