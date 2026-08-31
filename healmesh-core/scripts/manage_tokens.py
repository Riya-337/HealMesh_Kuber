#!/usr/bin/env python3
"""
healmesh-core/scripts/manage_tokens.py

Admin CLI for managing HealMesh SDK API Tokens.
Supports:
  - issue: Generate a new scoped bearer token, print it once, store SHA-256 hash.
  - revoke: Invalidate a token immediately.
  - list: Display all issued tokens with active status and expiry.

Usage:
  python manage_tokens.py issue --name "github-actions-ci" --ttl-days 90
  python manage_tokens.py revoke --token-id "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  python manage_tokens.py list
"""
import argparse
import os
import sys

# Ensure healmesh-core root is on python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from auth.token_repo import TokenRepository


def cmd_issue(args):
    repo = TokenRepository()
    record, raw_token = repo.issue_token(
        name=args.name,
        ttl_days=args.ttl_days,
        issuer_actor=args.actor or "admin_cli",
    )
    print("\n========================================================")
    print("           HEALMESH API TOKEN ISSUED SUCCESSFULLY        ")
    print("========================================================")
    print(f" Token ID    : {record.token_id}")
    print(f" Name        : {record.name}")
    print(f" Capabilities: {[c.value for c in record.capabilities]}")
    print(f" Created At  : {record.created_at.isoformat()}")
    print(f" Expires At  : {record.expires_at.isoformat()} ({args.ttl_days} days)")
    print("--------------------------------------------------------")
    print(" Raw Bearer Token (SAVE THIS NOW - IT WILL NOT BE SHOWN AGAIN):")
    print(f"\n {raw_token}\n")
    print("========================================================\n")


def cmd_revoke(args):
    repo = TokenRepository()
    success = repo.revoke_token(token_id=args.token_id, revoked_by=args.actor or "admin_cli")
    if success:
        print(f"✓ Successfully revoked token: {args.token_id}")
    else:
        print(f"✗ Failed to revoke token {args.token_id}. Token not found or already inactive.")
        sys.exit(1)


def cmd_list(args):
    repo = TokenRepository()
    tokens = repo.list_tokens()
    if not tokens:
        print("No API tokens found.")
        return

    print(f"\n{'TOKEN ID':<38} {'NAME':<24} {'ACTIVE':<8} {'EXPIRES AT':<26} {'CAPABILITIES'}")
    print("-" * 110)
    for t in tokens:
        caps_str = ",".join(c.value for c in t.capabilities)
        status_str = "YES" if t.is_active else "REVOKED"
        print(f"{str(t.token_id):<38} {t.name:<24} {status_str:<8} {t.expires_at.isoformat():<26} {caps_str}")
    print()


def main():
    parser = argparse.ArgumentParser(description="HealMesh API Token Management CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Issue
    p_issue = subparsers.add_parser("issue", help="Issue a new API token")
    p_issue.add_argument("--name", required=True, help="Human-readable name/identifier for the token client")
    p_issue.add_argument("--ttl-days", type=int, default=90, help="Days until token expires (1-365, default: 90)")
    p_issue.add_argument("--actor", default="admin_cli", help="Issuer identifier for audit logging")
    p_issue.set_defaults(func=cmd_issue)

    # Revoke
    p_revoke = subparsers.add_parser("revoke", help="Revoke an existing API token")
    p_revoke.add_argument("--token-id", required=True, help="UUID of the token to revoke")
    p_revoke.add_argument("--actor", default="admin_cli", help="Revoker identifier for audit logging")
    p_revoke.set_defaults(func=cmd_revoke)

    # List
    p_list = subparsers.add_parser("list", help="List all API tokens")
    p_list.set_defaults(func=cmd_list)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
