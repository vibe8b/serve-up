#!/usr/bin/env python3
"""
One-time Gmail App Password setup for IRN /mockup command.

This script guides you through creating a Gmail App Password
and stores it where Claude Code can find it.

Run once:
    python3 scripts/setup_gmail_creds.py
"""

import os
import sys
import json
import subprocess
import smtplib
from pathlib import Path
from getpass import getpass


GMAIL_ACCOUNT = "eitanbarzeski@gmail.com"
CLAUDE_SETTINGS_LOCAL = Path(".claude/settings.local.json")


def test_smtp(password: str) -> bool:
    """Verify the app password works."""
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_ACCOUNT, password)
        return True
    except Exception:
        return False


def save_to_claude_settings(password: str):
    """Write env var into .claude/settings.local.json (gitignored)."""
    CLAUDE_SETTINGS_LOCAL.parent.mkdir(parents=True, exist_ok=True)

    existing = {}
    if CLAUDE_SETTINGS_LOCAL.exists():
        try:
            existing = json.loads(CLAUDE_SETTINGS_LOCAL.read_text())
        except Exception:
            pass

    existing.setdefault("env", {})
    existing["env"]["GMAIL_APP_PASSWORD"] = password

    CLAUDE_SETTINGS_LOCAL.write_text(json.dumps(existing, indent=2))
    print(f"✅ Saved to {CLAUDE_SETTINGS_LOCAL}")


def main():
    print()
    print("╔══════════════════════════════════════════════╗")
    print("║   IRN /mockup — Gmail App Password Setup    ║")
    print("╚══════════════════════════════════════════════╝")
    print()
    print("You need a Gmail App Password to send mockups automatically.")
    print(f"Account: {GMAIL_ACCOUNT}")
    print()
    print("Steps:")
    print("  1. Go to: https://myaccount.google.com/apppasswords")
    print("  2. Sign in if needed")
    print("  3. Select app: 'Mail'  →  Select device: 'Mac' (or Other)")
    print("  4. Click 'Generate'")
    print("  5. Copy the 16-character password shown (e.g. 'abcd efgh ijkl mnop')")
    print()

    password = getpass("Paste your App Password here (input hidden): ").strip().replace(" ", "")

    if len(password) != 16:
        print(f"⚠️  Expected 16 chars, got {len(password)}. Continuing anyway...")

    print()
    print("🔍 Testing credentials...")
    if test_smtp(password):
        print("✅ Credentials verified!")
    else:
        print("❌ Auth failed. Double-check your App Password and that 2-Step is enabled.")
        print("   Visit: https://myaccount.google.com/security")
        sys.exit(1)

    # Save locally (for local Claude Code)
    save_to_claude_settings(password)

    # Also try to set via claude CLI (for cloud)
    print()
    print("Setting env var in Claude Code...")
    result = subprocess.run(
        ["claude", "config", "set", "env.GMAIL_APP_PASSWORD", password],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print("✅ Set via `claude config set` (works locally + cloud)")
    else:
        print("ℹ️  `claude config` not available here — using settings.local.json only")
        print("   For Claude Code cloud, also run:")
        print(f"   claude config set env.GMAIL_APP_PASSWORD '{password}'")

    print()
    print("━" * 50)
    print("✅ Setup complete. You can now use /mockup in Claude Code.")
    print("━" * 50)
    print()
    print("Test it:")
    print("  python3 scripts/send_mockup.py /tmp/test.html")
    print()


if __name__ == "__main__":
    main()
