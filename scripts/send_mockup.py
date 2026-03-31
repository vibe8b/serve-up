#!/usr/bin/env python3
"""
send_mockup.py — Emails an IRN HTML mockup + project status report to eitanbarzeski@gmail.com
Usage: python3 scripts/send_mockup.py <path/to/mockup.html> [project_name]
Requires: GMAIL_APP_PASSWORD env var (set via scripts/setup_gmail_creds.py)
"""

import os
import sys
import smtplib
import json
import re
from pathlib import Path
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

GMAIL_USER = "eitanbarzeski@gmail.com"
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 465

# ─── Status Parser ──────────────────────────────────────────────────────────

def parse_todo_md(project_root: Path) -> dict:
    """Read todo.md and extract KPIs + latest batch info."""
    todo_path = project_root / "todo.md"
    if not todo_path.exists():
        return None

    content = todo_path.read_text()
    batches = re.split(r"(?=^## BATCH-)", content, flags=re.MULTILINE)

    all_rows = []
    batch_summaries = []

    for batch in batches:
        if not batch.strip() or not batch.startswith("## BATCH-"):
            continue
        header_match = re.match(r"## (BATCH-\d+) \| ([\d-]+) \| \"(.+?)\"", batch)
        if not header_match:
            continue
        batch_id, batch_date, batch_summary = header_match.groups()

        rows = re.findall(
            r"^\| (\S+) \| (.+?) \| (T\d) \| (\S+) \| (\w+) \| (.*?) \|",
            batch,
            re.MULTILINE
        )
        batch_rows = []
        for row in rows:
            task_id, task, tier, agent, status, notes = row
            all_rows.append({"id": task_id, "task": task.strip(), "tier": tier,
                              "agent": agent.strip(), "status": status.strip(), "notes": notes.strip()})
            batch_rows.append({"id": task_id, "task": task.strip(), "tier": tier,
                                "agent": agent.strip(), "status": status.strip(), "notes": notes.strip()})

        batch_summaries.append({
            "id": batch_id,
            "date": batch_date,
            "summary": batch_summary,
            "rows": batch_rows
        })

    if not all_rows:
        return None

    total = len(all_rows)
    done = sum(1 for r in all_rows if r["status"] == "done")
    blocked = sum(1 for r in all_rows if r["status"] == "blocked")
    wip = sum(1 for r in all_rows if r["status"] == "wip")
    pct = round((done / total) * 100) if total > 0 else 0

    return {
        "total": total,
        "done": done,
        "blocked": blocked,
        "wip": wip,
        "pct": pct,
        "batches": batch_summaries,
        "latest_batch": batch_summaries[-1] if batch_summaries else None,
    }


def read_git_info(project_root: Path) -> dict:
    """Extract git branch + last commit from .git if available."""
    try:
        head_path = project_root / ".git" / "HEAD"
        if not head_path.exists():
            return {}
        head = head_path.read_text().strip()
        branch = head.replace("ref: refs/heads/", "") if head.startswith("ref:") else head[:7]

        commit_path = project_root / ".git" / "ORIG_HEAD"
        log_path = project_root / ".git" / "logs" / "HEAD"
        last_commit = ""
        if log_path.exists():
            lines = log_path.read_text().strip().splitlines()
            if lines:
                last_line = lines[-1]
                parts = last_line.split("\t")
                if len(parts) > 1:
                    last_commit = parts[1][:72]

        return {"branch": branch, "last_commit": last_commit}
    except Exception:
        return {}


STATUS_COLORS = {
    "done": "#34D399",
    "wip": "#B09CF0",
    "pending": "#6B7280",
    "blocked": "#F87171",
}

def status_badge(status: str) -> str:
    color = STATUS_COLORS.get(status, "#6B7280")
    return (
        f'<span style="background:{color}22;color:{color};border:1px solid {color}55;'
        f'padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;'
        f'text-transform:uppercase;letter-spacing:0.5px">{status}</span>'
    )


def build_status_html(stats: dict, git: dict, project_name: str) -> str:
    if not stats:
        return '<p style="color:#6B7280;font-style:italic">No todo.md found — no status to report.</p>'

    rows_html = ""
    if stats["latest_batch"]:
        lb = stats["latest_batch"]
        rows_html = f"""
        <h3 style="color:#E5E7EB;font-size:13px;margin:20px 0 10px;text-transform:uppercase;
            letter-spacing:1px;font-weight:700">{lb['id']} — "{lb['summary']}"</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="border-bottom:1px solid #2A2A2F">
              <th style="text-align:left;padding:6px 8px;color:#9CA3AF;font-weight:600">ID</th>
              <th style="text-align:left;padding:6px 8px;color:#9CA3AF;font-weight:600">Task</th>
              <th style="text-align:left;padding:6px 8px;color:#9CA3AF;font-weight:600">Tier</th>
              <th style="text-align:left;padding:6px 8px;color:#9CA3AF;font-weight:600">Agent</th>
              <th style="text-align:left;padding:6px 8px;color:#9CA3AF;font-weight:600">Status</th>
            </tr>
          </thead>
          <tbody>
        """
        for row in lb["rows"]:
            rows_html += f"""
            <tr style="border-bottom:1px solid #1C1C1F">
              <td style="padding:7px 8px;color:#6B7280;font-family:monospace">{row['id']}</td>
              <td style="padding:7px 8px;color:#E5E7EB">{row['task']}</td>
              <td style="padding:7px 8px;color:#B09CF0;font-weight:600">{row['tier']}</td>
              <td style="padding:7px 8px;color:#9CA3AF">{row['agent']}</td>
              <td style="padding:7px 8px">{status_badge(row['status'])}</td>
            </tr>"""
        rows_html += "</tbody></table>"

    pct = stats["pct"]
    bar_color = "#34D399" if pct >= 80 else "#B09CF0" if pct >= 40 else "#F59E0B"
    git_line = ""
    if git.get("branch"):
        git_line = f'<span style="color:#6B7280;font-size:11px">Branch: <code style="color:#B09CF0">{git["branch"]}</code></span>'
        if git.get("last_commit"):
            git_line += f' &nbsp;·&nbsp; <span style="color:#6B7280;font-size:11px">Last commit: <code style="color:#9CA3AF">{git["last_commit"]}</code></span>'

    return f"""
    <div style="background:#13131A;border:1px solid #2A2A2F;border-radius:16px;padding:24px;margin-bottom:32px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="color:#E5E7EB;font-size:16px;font-weight:700;margin:0">{project_name} — Project Status</h2>
        <span style="color:#6B7280;font-size:11px">{datetime.now().strftime('%Y-%m-%d %H:%M')}</span>
      </div>
      {git_line}
      <div style="margin:16px 0 8px;background:#0D0D12;border-radius:8px;height:6px;overflow:hidden">
        <div style="height:100%;width:{pct}%;background:{bar_color};border-radius:8px;
            transition:width 0.3s ease"></div>
      </div>
      <div style="display:flex;gap:24px;margin-bottom:20px">
        <div style="text-align:center">
          <div style="color:#34D399;font-size:22px;font-weight:800">{stats['done']}</div>
          <div style="color:#6B7280;font-size:11px">Done</div>
        </div>
        <div style="text-align:center">
          <div style="color:#B09CF0;font-size:22px;font-weight:800">{stats['wip']}</div>
          <div style="color:#6B7280;font-size:11px">In Progress</div>
        </div>
        <div style="text-align:center">
          <div style="color:#F59E0B;font-size:22px;font-weight:800">{stats['total'] - stats['done'] - stats['wip'] - stats['blocked']}</div>
          <div style="color:#6B7280;font-size:11px">Pending</div>
        </div>
        <div style="text-align:center">
          <div style="color:#F87171;font-size:22px;font-weight:800">{stats['blocked']}</div>
          <div style="color:#6B7280;font-size:11px">Blocked</div>
        </div>
        <div style="text-align:center;margin-left:auto">
          <div style="color:{bar_color};font-size:22px;font-weight:800">{pct}%</div>
          <div style="color:#6B7280;font-size:11px">Complete</div>
        </div>
      </div>
      {rows_html}
    </div>
    """


# ─── Email Builder ───────────────────────────────────────────────────────────

def build_email_html(html_path: Path, stats: dict, git: dict, project_name: str) -> str:
    mockup_html = html_path.read_text()

    status_section = build_status_html(stats, git, project_name)

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{project_name} — Mockup + Status</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
    background: #0D0D12;
    color: #E5E7EB;
    padding: 32px 16px;
  }}
  .container {{ max-width: 900px; margin: 0 auto; }}
  .header {{
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 32px; padding-bottom: 20px;
    border-bottom: 1px solid #2A2A2F;
  }}
  .logo {{
    width: 40px; height: 40px; border-radius: 10px;
    background: linear-gradient(135deg, #B09CF0, #7B5FE8);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 18px; color: white;
  }}
  .divider {{
    height: 1px; background: #2A2A2F; margin: 32px 0;
  }}
  .section-label {{
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: #6B7280; margin-bottom: 16px;
  }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">IRN</div>
    <div>
      <div style="font-size:18px;font-weight:700;color:#E5E7EB">{project_name}</div>
      <div style="font-size:12px;color:#6B7280">Mockup + Status Report · {datetime.now().strftime('%B %d, %Y')}</div>
    </div>
  </div>

  <div class="section-label">Project Status</div>
  {status_section}

  <div class="divider"></div>

  <div class="section-label">UI Mockups</div>
  <p style="color:#9CA3AF;font-size:13px;margin-bottom:24px">
    Source-accurate HTML mockup generated from SwiftUI source.
    See attachment for standalone file.
  </p>

  {mockup_html}

  <div class="divider"></div>
  <p style="color:#374151;font-size:11px;text-align:center">
    Generated by /mockup · Claude Code · {datetime.now().isoformat()}
  </p>
</div>
</body>
</html>"""


# ─── Main ────────────────────────────────────────────────────────────────────

def send_mockup(html_path_str: str, project_name: str = None):
    html_path = Path(html_path_str)
    if not html_path.exists():
        print(f"❌ File not found: {html_path}")
        sys.exit(1)

    app_password = os.environ.get("GMAIL_APP_PASSWORD")
    if not app_password:
        # Try reading from .claude/settings.local.json
        settings_paths = [
            Path(".claude/settings.local.json"),
            Path.home() / ".claude" / "settings.local.json",
        ]
        for sp in settings_paths:
            if sp.exists():
                try:
                    data = json.loads(sp.read_text())
                    app_password = data.get("env", {}).get("GMAIL_APP_PASSWORD")
                    if app_password:
                        break
                except Exception:
                    pass

    if not app_password:
        print("❌ GMAIL_APP_PASSWORD not set. Run: python3 scripts/setup_gmail_creds.py")
        sys.exit(1)

    # Detect project name from git remote or directory
    if not project_name:
        project_name = Path.cwd().name.upper()

    project_root = Path.cwd()
    stats = parse_todo_md(project_root)
    git = read_git_info(project_root)

    # Build combined email
    email_html = build_email_html(html_path, stats, git, project_name)

    # Build message
    msg = MIMEMultipart("mixed")
    msg["From"] = GMAIL_USER
    msg["To"] = GMAIL_USER
    msg["Subject"] = f"[{project_name}] Mockup + Status — {datetime.now().strftime('%Y-%m-%d %H:%M')}"

    # HTML body
    body_part = MIMEText(email_html, "html", "utf-8")
    msg.attach(body_part)

    # HTML file attachment
    attachment = MIMEBase("text", "html")
    attachment.set_payload(html_path.read_bytes())
    encoders.encode_base64(attachment)
    attachment.add_header(
        "Content-Disposition",
        f'attachment; filename="{html_path.name}"'
    )
    msg.attach(attachment)

    # Send
    print(f"📤 Sending to {GMAIL_USER}...")
    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
        server.login(GMAIL_USER, app_password)
        server.sendmail(GMAIL_USER, [GMAIL_USER], msg.as_string())

    print(f"✅ Sent: [{project_name}] Mockup + Status — {html_path.name}")
    if stats:
        print(f"   Status: {stats['done']}/{stats['total']} ({stats['pct']}%) | "
              f"Blocked: {stats['blocked']} | WIP: {stats['wip']}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/send_mockup.py <mockup.html> [project_name]")
        sys.exit(1)
    project_name_arg = sys.argv[2] if len(sys.argv) > 2 else None
    send_mockup(sys.argv[1], project_name_arg)
