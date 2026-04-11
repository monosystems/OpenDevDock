# Release Drafter Publish Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Release Drafter use the same bare semver tag format as the repo and ensure published releases come from the Release Drafter draft flow.

**Architecture:** Keep Release Drafter responsible for creating the draft release body on pushes to `main`. Make the release build workflow run when that draft is published, so the published release reuses the drafted notes instead of creating a separate release path. Align tag naming to bare semver (`0.1.3`) so drafts and published releases refer to the same tag.

**Tech Stack:** GitHub Actions, Release Drafter, softprops/action-gh-release, YAML

### Task 1: Align Release Drafter tag format

**Files:**
- Modify: `.github/release-drafter.yml`

**Step 1: Update draft naming**

Change `name-template` and `tag-template` to use `$RESOLVED_VERSION` without a `v` prefix.

**Step 2: Keep changelog formatting rules**

Preserve the existing `change-template`, `autolabeler`, and `replacers` entries so PR-title based notes still render as `Feature:`, `Fix:`, etc.

**Step 3: Verify YAML syntax**

Run: `ruby -e 'require "yaml"; YAML.load_file(".github/release-drafter.yml")'`
Expected: command exits successfully.

### Task 2: Make publish use the draft release path

**Files:**
- Modify: `.github/workflows/release.yml`

**Step 1: Update workflow trigger**

Change the workflow to run on `release.published` instead of tag pushes or `release.created`.

**Step 2: Reuse the published draft release**

Use `github.event.release.tag_name` for `tag_name` in the upload step so assets attach to the already-published draft release.

**Step 3: Avoid replacing release notes**

Keep `softprops/action-gh-release` limited to asset upload behavior so the release body continues to come from the Release Drafter draft.

**Step 4: Verify YAML syntax**

Run: `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/release.yml")'`
Expected: command exits successfully.

### Task 3: Verify the release path end to end

**Files:**
- Review: `.github/release-drafter.yml`
- Review: `.github/workflows/release.yml`

**Step 1: Validate both YAML files together**

Run: `ruby -e 'require "yaml"; YAML.load_file(".github/release-drafter.yml"); YAML.load_file(".github/workflows/release.yml"); puts "YAML OK"'`
Expected: `YAML OK`

**Step 2: Review the Git diff**

Run: `git diff -- .github/release-drafter.yml .github/workflows/release.yml docs/plans/2026-04-11-release-drafter-publish-flow.md`
Expected: only the tag-format and release-trigger changes plus the plan file.
