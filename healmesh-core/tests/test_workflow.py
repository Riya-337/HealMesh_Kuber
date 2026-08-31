"""
healmesh-core/tests/test_workflow.py

Unit tests for approval workflow operations.
Tests process_approval, start_execution, and log_execution_event.
"""
from unittest.mock import MagicMock
import pytest
from approval.workflow import ApprovalRecord, process_approval, start_execution, log_execution_event


def test_approval_record_model():
    rec = ApprovalRecord(
        action_id="act-123",
        decision="approved",
        approver_id="U12345",
        approver_name="Alice",
    )
    assert rec.action_id == "act-123"
    assert rec.decision == "approved"
    assert rec.approver_id == "U12345"
    assert rec.approver_name == "Alice"


def test_process_approval():
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = ("appr-uuid-1", "approved")
    mock_conn = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

    res = process_approval(mock_conn, "act-123", "approved", "U12345", "Alice")
    assert res == ("appr-uuid-1", "approved")
    mock_cursor.execute.assert_called_once()
    sql, params = mock_cursor.execute.call_args[0]
    assert "INSERT INTO healmesh.approvals" in sql
    assert params == ("act-123", "approved", "U12345", "Alice")


def test_start_execution():
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = ("exec-uuid-1",)
    mock_conn = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

    res = start_execution(mock_conn, "appr-uuid-1")
    assert res == "exec-uuid-1"
    mock_cursor.execute.assert_called_once()
    sql, params = mock_cursor.execute.call_args[0]
    assert "INSERT INTO healmesh.executions" in sql
    assert params == ("appr-uuid-1",)


def test_log_execution_event_with_snapshots():
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = ("exec-uuid-2",)
    mock_conn = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

    pre = {"replicas": 1}
    post = {"replicas": 3}
    res = log_execution_event(
        mock_conn,
        "appr-uuid-1",
        "completed",
        pre_snapshot=pre,
        post_snapshot=post,
        error_msg=None,
    )
    assert res == "exec-uuid-2"
    mock_cursor.execute.assert_called_once()
    sql, params = mock_cursor.execute.call_args[0]
    assert "INSERT INTO healmesh.executions" in sql
    assert params[0] == "appr-uuid-1"
    assert params[1] == "completed"
    assert '"replicas": 1' in params[2]
    assert '"replicas": 3' in params[3]
    assert params[4] is None


def test_log_execution_event_with_error():
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = ("exec-uuid-3",)
    mock_conn = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

    res = log_execution_event(
        mock_conn,
        "appr-uuid-1",
        "failed",
        pre_snapshot=None,
        post_snapshot=None,
        error_msg="Timeout waiting for deployment rollout",
    )
    assert res == "exec-uuid-3"
    mock_cursor.execute.assert_called_once()
    sql, params = mock_cursor.execute.call_args[0]
    assert params[2] is None
    assert params[3] is None
    assert params[4] == "Timeout waiting for deployment rollout"
