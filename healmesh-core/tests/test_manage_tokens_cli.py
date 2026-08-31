"""
healmesh-core/tests/test_manage_tokens_cli.py

Unit tests for the manage_tokens.py CLI utility.
"""
import io
import sys
from unittest.mock import patch
import pytest

from scripts.manage_tokens import main


def test_cli_issue_and_list_and_revoke(capsys):
    # 1. Issue token
    test_args = ["manage_tokens.py", "issue", "--name", "cli-test-token", "--ttl-days", "45"]
    with patch.object(sys, "argv", test_args):
        main()

    captured = capsys.readouterr().out
    assert "HEALMESH API TOKEN ISSUED SUCCESSFULLY" in captured
    assert "cli-test-token" in captured
    assert "hm_live_" in captured

    # Extract Token ID from output
    token_id = None
    for line in captured.splitlines():
        if "Token ID" in line:
            token_id = line.split(":", 1)[1].strip()
            break
    assert token_id is not None

    # 2. List tokens
    test_args = ["manage_tokens.py", "list"]
    with patch.object(sys, "argv", test_args):
        main()

    captured_list = capsys.readouterr().out
    assert "cli-test-token" in captured_list
    assert token_id in captured_list

    # 3. Revoke token
    test_args = ["manage_tokens.py", "revoke", "--token-id", token_id]
    with patch.object(sys, "argv", test_args):
        main()

    captured_revoke = capsys.readouterr().out
    assert f"Successfully revoked token: {token_id}" in captured_revoke


def test_cli_revoke_invalid_token(capsys):
    test_args = ["manage_tokens.py", "revoke", "--token-id", "00000000-0000-0000-0000-000000000000"]
    with patch.object(sys, "argv", test_args):
        with pytest.raises(SystemExit):
            main()
    captured = capsys.readouterr().out
    assert "Failed to revoke token" in captured
