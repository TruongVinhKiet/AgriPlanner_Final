import subprocess, os, sys

os.chdir(r'd:\Agriplanner')

def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='utf-8')
    if r.returncode != 0 and r.stderr:
        print(f'  ERR: {r.stderr[:300]}')
    if r.stdout.strip():
        print(f'  OUT: {r.stdout.strip()[:200]}')
    return r.returncode == 0

# Xoa file rac
for f in ['github_script_f1.md', 'github_script_f2.md', 'github_script_f3.md']:
    p = os.path.join(r'd:\Agriplanner', f)
    if os.path.exists(p):
        os.remove(p)
        print(f'Deleted: {f}')

# Checkout main
run('git checkout main')

# ========== F1 ==========
print('\n=== F1: feature/f1-labor-management ===')
run('git checkout -b feature/f1-labor-management')

with open(r'd:\Agriplanner\example\F1\labor.html', 'r', encoding='utf-8') as f:
    src = f.readlines()

# Find <body
head_end = 0
for i, line in enumerate(src):
    if '<body' in line.lower():
        head_end = i
        break

# Commit 1: Head + Sidebar (lines 0 to head_end-1, plus find sidebar end)
# Actually per script: head to end of sidebar (~500 lines)
# Let's take up to line 500 or until sidebar closes
sidebar_end = min(500, head_end)
if head_end > 0:
    sidebar_end = head_end

# Find the sidebar closing tag after <body>
for i in range(head_end, min(head_end + 600, len(src))):
    if '</aside>' in src[i].lower():
        sidebar_end = i + 1
        break

commit1_lines = src[:sidebar_end] + ['</body>\n', '</html>\n']
with open(r'd:\Agriplanner\pages\labor.html', 'w', encoding='utf-8') as f:
    f.writelines(commit1_lines)

run('git add pages/labor.html')
run('git commit -m "feat(labor): Dung khung giao dien Quan ly Nhan cong - Head CSS va Sidebar"')
print(f'F1 Commit 1 done: {sidebar_end} lines (head + sidebar)')

run('git checkout main')

# ========== F2 ==========
print('\n=== F2: feature/f2-cultivation-map ===')
run('git checkout -b feature/f2-cultivation-map')

with open(r'd:\Agriplanner\example\F2\cultivation.html', 'r', encoding='utf-8') as f:
    src2 = f.readlines()

head_end2 = 0
for i, line in enumerate(src2):
    if '<body' in line.lower():
        head_end2 = i
        break

commit1_f2 = src2[:head_end2] + ['<body data-page="cultivation">\n', '</body>\n', '</html>\n']
with open(r'd:\Agriplanner\pages\cultivation.html', 'w', encoding='utf-8') as f:
    f.writelines(commit1_f2)

run('git add pages/cultivation.html')
run('git commit -m "feat(cultivation): Dung khung Head CSS voi Leaflet, Chart.js va 1500 dong map styles"')
print(f'F2 Commit 1 done: {head_end2} head lines')

run('git checkout main')

# ========== F3 ==========
print('\n=== F3: feature/f3-voice-search ===')
run('git checkout -b feature/f3-voice-search')

with open(r'd:\Agriplanner\example\F3\voice-search-backup.js', 'r', encoding='utf-8') as f:
    backup = f.readlines()

# CSS FAB + popup: lines 88-350 (0-indexed: 87-349)
header_comment = '\n// ============ VOICE SEARCH SYSTEM ============\n// Voice recognition search widget\n\n'
css_part1 = backup[87:350]

with open(r'd:\Agriplanner\js\admin.js', 'r', encoding='utf-8') as f:
    admin = f.read()

with open(r'd:\Agriplanner\js\admin.js', 'w', encoding='utf-8') as f:
    f.write(admin)
    f.write(header_comment)
    f.writelines(css_part1)

run('git add js/admin.js')
run('git commit -m "feat(voice): Them CSS FAB button gradient, popup panel va pulse ring animations"')
print('F3 Commit 1 done')

# Push all 3
print('\n=== Pushing all branches ===')
run('git checkout feature/f1-labor-management')
run('git push -u origin feature/f1-labor-management')
run('git checkout feature/f2-cultivation-map')
run('git push -u origin feature/f2-cultivation-map')
run('git checkout feature/f3-voice-search')
run('git push -u origin feature/f3-voice-search')

# Verify
print('\n=== VERIFICATION ===')
run('git checkout feature/f1-labor-management')
run('git log --oneline -2')
run('git checkout feature/f2-cultivation-map')
run('git log --oneline -2')
run('git checkout feature/f3-voice-search')
run('git log --oneline -2')

print('\nBranches:')
run('git branch -a')
print('\nDONE!')
