# 📊 VS Code Git GUI Guide - Viewing glorisonglotech Repository

**Repository**: https://github.com/glorisonglotech/omnibiz.git  
**Your Current Remote**: ✅ Already pointing to glorisonglotech!

---

## ✅ Verification: You're Already on the Team Repo!

Your repository is correctly configured:
```
origin: https://github.com/glorisonglotech/omnibiz.git (fetch)
origin: https://github.com/glorisonglotech/omnibiz.git (push)
```

**This means**:
- ✅ You're working with the team's repository
- ✅ All your commits go to glorisonglotech
- ✅ You can see all team members' changes
- ✅ VS Code GUI will show the glorisonglotech repository

---

## 🎨 Method 1: Built-in VS Code Source Control

### **Step 1: Open Source Control Panel**

**Option A**: Click the icon
- Look for the branch/fork icon in the left sidebar (3rd icon from top)
- Click it to open Source Control panel

**Option B**: Keyboard shortcut
- Press `Ctrl+Shift+G` (Linux/Windows)
- Press `Cmd+Shift+G` (Mac)

### **Step 2: View Current Changes**

In the Source Control panel, you'll see:
- **Changes** - Files you've modified locally
- **Staged Changes** - Files ready to commit
- **Merge Changes** - If you're merging branches

**To view a file's changes**:
1. Click on any file in the list
2. VS Code opens a diff view showing:
   - Left side: Original version
   - Right side: Your changes
   - Green highlights: Added lines
   - Red highlights: Deleted lines

### **Step 3: View Commit History**

1. Click the `...` (three dots) at the top of Source Control panel
2. Select one of these options:
   - **"Commit" → "View History"** - See all commits
   - **"Pull"** - Get latest changes from glorisonglotech
   - **"Push"** - Send your commits to glorisonglotech
   - **"Sync"** - Pull and push in one action

---

## 🚀 Method 2: GitLens Extension (BEST OPTION)

GitLens is the most powerful Git extension for VS Code. It shows:
- Inline blame annotations
- Commit history
- File history
- Branch comparisons
- Repository insights
- And much more!

### **Install GitLens**

**Option A: VS Code Marketplace**
1. Click Extensions icon in left sidebar (or press `Ctrl+Shift+X`)
2. Search for "GitLens"
3. Click "Install" on "GitLens — Git supercharged" by GitKraken
4. Wait for installation to complete

**Option B: Command Line**
```bash
code --install-extension eamodio.gitlens
```

### **Using GitLens to View Repository**

Once installed, you'll see new features:

#### **1. GitLens Sidebar**
- Click the GitLens icon in the left sidebar
- You'll see:
  - **Commits** - All commits in current branch
  - **Branches** - All local and remote branches
  - **Remotes** - Shows glorisonglotech repository
  - **Stashes** - Saved work in progress
  - **Tags** - Release tags
  - **Contributors** - Team members who committed
  - **File History** - History of current file

#### **2. Inline Blame Annotations**
- Open any file
- You'll see gray text at the end of each line showing:
  - Who last modified that line
  - When it was modified
  - Commit message
- Click the annotation to see full commit details

#### **3. View Commit Graph**
1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "GitLens: Show Commit Graph"
3. Press Enter
4. You'll see a visual graph of all commits and branches

#### **4. Compare Branches**
1. Click GitLens icon in sidebar
2. Go to "Branches" section
3. Right-click on any branch
4. Select "Compare with Current Branch"
5. See all differences between branches

#### **5. View File History**
1. Open any file
2. Right-click in the editor
3. Select "GitLens: Open File History"
4. See all commits that modified this file

---

## 🌳 Method 3: Git Graph Extension

Another excellent extension for visualizing Git history.

### **Install Git Graph**

1. Open Extensions (`Ctrl+Shift+X`)
2. Search for "Git Graph"
3. Install "Git Graph" by mhutchie
4. Click "Reload" if prompted

### **Using Git Graph**

1. Open Source Control panel (`Ctrl+Shift+G`)
2. Click "Git Graph" button at the top
3. Or click the "Git Graph" icon in the bottom status bar
4. You'll see:
   - Visual graph of all commits
   - All branches (local and remote)
   - Commit messages and authors
   - Dates and times

**Features**:
- Click any commit to see details
- Right-click commits for actions (checkout, cherry-pick, revert, etc.)
- Filter by branch, author, or date
- Search commits

---

## 📁 Method 4: VS Code Timeline View

Built into VS Code, shows file history.

### **Using Timeline**

1. Open any file
2. Look at the bottom of the Explorer panel (left sidebar)
3. You'll see a "TIMELINE" section
4. Expand it to see:
   - All commits that modified this file
   - When each change was made
   - Who made the change
5. Click any timeline entry to see the diff

---

## 🔍 Method 5: Compare with Remote (glorisonglotech)

### **Compare Your Branch with Remote Main**

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Git: Fetch"
3. Press Enter (this updates remote branch info)
4. Then type "Git: Compare with..."
5. Select "origin/main" (this is glorisonglotech's main branch)
6. See all differences

### **View Remote Branches**

1. Click Source Control panel
2. Click branch name in bottom-left corner
3. You'll see all branches:
   - Local branches (on your computer)
   - Remote branches (on glorisonglotech)
4. Click any remote branch to check it out

---

## 🎯 Quick Actions in VS Code GUI

### **Pull Latest Changes from glorisonglotech**

**Option 1: Status Bar**
- Click the sync icon (↻) in bottom-left status bar
- This pulls and pushes changes

**Option 2: Source Control Panel**
1. Click `...` (three dots)
2. Select "Pull"

**Option 3: Command Palette**
1. Press `Ctrl+Shift+P`
2. Type "Git: Pull"
3. Press Enter

### **Push Your Changes to glorisonglotech**

**Option 1: Source Control Panel**
1. Stage your changes (click `+` next to files)
2. Type commit message in the text box
3. Click the checkmark (✓) to commit
4. Click `...` → "Push"

**Option 2: Status Bar**
- Click the sync icon (↻) in bottom-left

### **View Diff of Any File**

1. In Source Control panel, click any modified file
2. Or right-click file in Explorer → "Open Changes"
3. Or use Command Palette → "Git: Open Changes"

### **View All Changes in Current Branch**

1. Command Palette (`Ctrl+Shift+P`)
2. Type "Git: View Changes"
3. Select the comparison you want

---

## 📊 Understanding VS Code Git Icons

### **Status Bar (Bottom-Left)**

- **Branch icon + name** (e.g., `main`) - Current branch
- **Sync icon (↻)** - Pull and push changes
- **Number with ↓** - Commits to pull from glorisonglotech
- **Number with ↑** - Commits to push to glorisonglotech

### **Source Control Panel Icons**

- **`+` (Plus)** - Stage changes
- **`-` (Minus)** - Unstage changes
- **`↻` (Circular arrow)** - Discard changes
- **`✓` (Checkmark)** - Commit staged changes
- **`...` (Three dots)** - More actions menu

### **File Status Letters**

- **M** - Modified
- **A** - Added (new file)
- **D** - Deleted
- **R** - Renamed
- **U** - Untracked (not in Git yet)
- **C** - Conflict (needs resolution)

---

## 🔧 Recommended VS Code Settings for Git

Add these to your VS Code settings for better Git experience:

1. Open Settings (`Ctrl+,` or `Cmd+,`)
2. Search for each setting and enable:

```json
{
  "git.autofetch": true,
  "git.confirmSync": false,
  "git.enableSmartCommit": true,
  "git.suggestSmartCommit": true,
  "gitlens.currentLine.enabled": true,
  "gitlens.hovers.currentLine.over": "line",
  "gitlens.codeLens.enabled": true,
  "gitlens.statusBar.enabled": true
}
```

**What these do**:
- `git.autofetch` - Automatically fetch from glorisonglotech every few minutes
- `git.confirmSync` - Don't ask for confirmation when syncing
- `git.enableSmartCommit` - Auto-stage all changes when committing
- `gitlens.currentLine.enabled` - Show blame info on current line
- `gitlens.codeLens.enabled` - Show "Recent Changes" above functions

---

## 🎨 Viewing Specific Changes

### **View Changes from Last 3 Commits**

1. GitLens sidebar → "Commits"
2. Expand the last 3 commits
3. Click any file to see what changed

### **View All Changes by a Team Member**

1. GitLens sidebar → "Contributors"
2. Click on team member's name
3. See all their commits
4. Click any commit to see changes

### **View Changes in a Specific File**

1. Open the file
2. Right-click → "GitLens: Open File History"
3. See all commits that touched this file
4. Click any commit to see the diff

### **Compare Two Commits**

1. GitLens sidebar → "Commits"
2. Right-click first commit → "Select for Compare"
3. Right-click second commit → "Compare with Selected"
4. See all differences

---

## 🚀 Pro Tips

### **Tip 1: Use Git Graph for Visual Overview**
- Best for seeing the big picture
- Shows all branches and merges visually
- Easy to understand team's work

### **Tip 2: Use GitLens for Detailed Investigation**
- Best for understanding specific changes
- Shows who changed what and why
- Inline annotations are super helpful

### **Tip 3: Use Timeline for File-Specific History**
- Best for tracking changes to one file
- Quick and built-in (no extension needed)
- Shows file evolution over time

### **Tip 4: Fetch Regularly**
- Run "Git: Fetch" often to see latest remote changes
- Or enable `git.autofetch` in settings
- Keeps you updated with team's work

### **Tip 5: Use Command Palette for Everything**
- Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
- Type "Git:" to see all Git commands
- Faster than clicking through menus

---

## 📝 Quick Reference Commands

| Action | Keyboard Shortcut | Command Palette |
|--------|------------------|-----------------|
| Open Source Control | `Ctrl+Shift+G` | Git: Show Source Control |
| Commit | `Ctrl+Enter` (in message box) | Git: Commit |
| Pull | - | Git: Pull |
| Push | - | Git: Push |
| Sync | - | Git: Sync |
| Fetch | - | Git: Fetch |
| View History | - | GitLens: Show Commit Graph |
| Open File History | - | GitLens: Open File History |
| Compare Branches | - | Git: Compare with... |

---

## ✅ Verification: You're Viewing glorisonglotech

To confirm you're viewing the team repository:

1. **Check Remote in VS Code**:
   - Open Command Palette (`Ctrl+Shift+P`)
   - Type "Git: View Remote"
   - Should show: `https://github.com/glorisonglotech/omnibiz.git`

2. **Check in GitLens**:
   - GitLens sidebar → "Remotes"
   - Expand "origin"
   - Should show: `glorisonglotech/omnibiz`

3. **Check Status Bar**:
   - Bottom-left shows current branch
   - Click it to see all branches
   - Remote branches are prefixed with `origin/`

---

## 🆘 Troubleshooting

### **Problem: Can't see remote branches**

**Solution**:
1. Command Palette → "Git: Fetch"
2. Wait a few seconds
3. Refresh Source Control panel

### **Problem: GitLens not showing**

**Solution**:
1. Check if extension is installed (Extensions panel)
2. Reload VS Code (Command Palette → "Reload Window")
3. Check GitLens is enabled in settings

### **Problem: Changes not showing**

**Solution**:
1. Make sure you're on the right branch
2. Run "Git: Fetch" to update
3. Check if files are saved

---

**Status**: ✅ Your VS Code is already configured for glorisonglotech repository!  
**Recommendation**: Install GitLens extension for the best Git experience in VS Code

