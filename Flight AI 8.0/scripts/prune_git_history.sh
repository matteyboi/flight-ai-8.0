#!/bin/bash
# prune_git_history.sh
# Keeps only the last 20 commits in the current branch and deletes everything before that.
# WARNING: This is destructive. Old commits will be lost forever unless backed up.

set -e

# Optional: create a backup branch before pruning
backup_branch="backup-before-prune-$(date +%Y%m%d%H%M%S)"
git branch "$backup_branch"
echo "Backup branch created: $backup_branch"

# Find the hash of the 20th most recent commit
commit_hash=$(git rev-list --max-count=20 HEAD | tail -n 1)

if [ -z "$commit_hash" ]; then
  echo "Could not find the 20th commit. Aborting."
  exit 1
fi

echo "Resetting branch to keep only last 20 commits..."
git reset --hard "$commit_hash"

echo "Force-pushing to remote..."
git push --force

# Clean up old reflog and unreachable objects
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "Prune complete. Only last 20 commits remain."
