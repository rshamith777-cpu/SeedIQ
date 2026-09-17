"""
SeedIQ Centralized Audit & Activity Logger
Logs security, user, and data pipeline events to Supabase PostgreSQL and local SQLite.
Never records passwords, OTP codes, or credentials.
"""

import os
import json
import sqlite3
import datetime
from typing import Dict, Any, Optional
from flask import request, session

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'seediq.db')

def _ensure_sqlite_activity_table():
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.execute('''
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                event_type TEXT NOT NULL,
                details TEXT,
                status TEXT DEFAULT 'SUCCESS',
                ip_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[ACTIVITY_LOGGER] SQLite table init error: {e}")

_ensure_sqlite_activity_table()

def log_activity(
    event_type: str,
    user_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    status: str = "SUCCESS",
    ip_address: Optional[str] = None,
    token: Optional[str] = None
):
    """
    Logs an event to both Supabase and SQLite.
    Redacts any sensitive keys automatically.
    """
    if details is None:
        details = {}
        
    # Redact sensitive parameters
    safe_details = {}
    sensitive_keys = {'password', 'password_hash', 'otp', 'code', 'token', 'secret', 'secret_key'}
    for k, v in details.items():
        if k.lower() in sensitive_keys:
            safe_details[k] = "[REDACTED]"
        else:
            safe_details[k] = v

    # Fallback user ID from session if not explicitly provided
    if user_id is None:
        try:
            user_id = str(session.get('user_id', 'anonymous'))
        except Exception:
            user_id = "system"

    # Fallback IP address
    if ip_address is None:
        try:
            ip_address = request.remote_addr or "127.0.0.1"
        except Exception:
            ip_address = "127.0.0.1"

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    details_json = json.dumps(safe_details)

    # 1. Write to local SQLite (always available)
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.execute('''
            INSERT INTO activity_logs (user_id, event_type, details, status, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (str(user_id), event_type, details_json, status, ip_address, datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[ACTIVITY_LOGGER] SQLite write failed: {e}")

    # 2. Dual-write to Supabase
    try:
        from supabase_client import supabase
        supabase.insert_row("activity_logs", {
            "user_id": user_id if (isinstance(user_id, str) and len(user_id) == 36 and '-' in user_id) else None,
            "event_type": event_type,
            "details": safe_details,
            "status": status,
            "ip_address": ip_address,
            "created_at": now_iso
        }, token=token)
    except Exception as e:
        # Non-blocking, SQLite log succeeded
        pass
