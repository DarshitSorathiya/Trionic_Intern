import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CRPC_TREE_FILE = ROOT / "packages" / "pageindex" / "artifacts" / "crpc-tree.json"
SQL_OUTPUT_FILE = ROOT / "packages" / "pageindex" / "artifacts" / "crpc-insert.sql"
SQLITE_DB_FILE = ROOT / "packages" / "pageindex" / "artifacts" / "crpc.db"

SNAPSHOT_ID = "2026-05-28"

def escape_sql_str(val):
    if val is None:
        return "NULL"
    # Escape single quotes by doubling them
    escaped = val.replace("'", "''")
    return f"'{escaped}'"

def main():
    print("Generating database insertion logic...")

    if not CRPC_TREE_FILE.exists():
        print(f"Error: Tree file not found at {CRPC_TREE_FILE}")
        return

    with open(CRPC_TREE_FILE, "r", encoding="utf-8") as f:
        nodes = json.load(f)

    # 1. Generate SQL content
    sql_lines = []
    sql_lines.append("-- SQL Ingestion script for CrPC, 1973")
    sql_lines.append("-- Target DB: PostgreSQL (Supabase)")
    sql_lines.append("")
    
    # 1.1 Insert Act
    sql_lines.append("-- 1. Insert Act info")
    sql_lines.append(
        "INSERT INTO acts (act_code, full_name, year, source_url) "
        "VALUES ('CRPC-1973', 'Code of Criminal Procedure, 1973', 1973, 'https://indiacode.nic.in') "
        "ON CONFLICT (act_code) DO UPDATE SET full_name = EXCLUDED.full_name;"
    )
    sql_lines.append("")

    # 1.2 Insert Snapshot
    sql_lines.append("-- 2. Insert Act Snapshot info")
    sql_lines.append(
        f"INSERT INTO act_snapshots (snapshot_id, act_code, version_label, pulled_at, source_url, is_current) "
        f"VALUES ('CRPC-1973_{SNAPSHOT_ID}', 'CRPC-1973', 'v1', '{SNAPSHOT_ID}', 'https://indiacode.nic.in', true) "
        f"ON CONFLICT (snapshot_id) DO UPDATE SET is_current = EXCLUDED.is_current;"
    )
    sql_lines.append("")

    # 1.3 Insert Nodes
    sql_lines.append("-- 3. Insert PageIndex Nodes")
    for node in nodes:
        node_id = node["id"]
        parent_id = node.get("parent_id")
        node_type = node["type"]
        title = node["title"]
        text_content = node["text"]
        
        parent_id_val = escape_sql_str(parent_id)
        
        sql_lines.append(
            f"INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) "
            f"VALUES ("
            f"'{node_id}', "
            f"'CRPC-1973_{SNAPSHOT_ID}', "
            f"{parent_id_val}, "
            f"'{node_type}', "
            f"{escape_sql_str(title)}, "
            f"{escape_sql_str(text_content)}"
            f") ON CONFLICT (node_id, snapshot_id) DO UPDATE SET "
            f"text_content = EXCLUDED.text_content, label = EXCLUDED.label;"
        )

    # Write SQL script
    SQL_OUTPUT_FILE.write_text("\n".join(sql_lines), encoding="utf-8")
    print(f"Postgres SQL insertion script saved to {SQL_OUTPUT_FILE}")

    # 2. Local SQLite Verification
    print("\nVerifying SQL structure against local SQLite database...")
    
    # Remove old SQLite db if exists
    if SQLITE_DB_FILE.exists():
        SQLITE_DB_FILE.unlink()

    conn = sqlite3.connect(str(SQLITE_DB_FILE))
    cursor = conn.cursor()

    # DDL
    cursor.execute("""
    CREATE TABLE acts (
      act_code       TEXT PRIMARY KEY,
      full_name      TEXT NOT NULL,
      year           INTEGER NOT NULL,
      source_url     TEXT NOT NULL,
      created_at     TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE act_snapshots (
      snapshot_id    TEXT PRIMARY KEY,
      act_code       TEXT REFERENCES acts(act_code),
      version_label  TEXT NOT NULL,
      pulled_at      TEXT NOT NULL,
      source_url     TEXT NOT NULL,
      is_current     BOOLEAN DEFAULT 0,
      notes          TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE pageindex_nodes (
      node_id        TEXT NOT NULL,
      snapshot_id    TEXT REFERENCES act_snapshots(snapshot_id),
      parent_id      TEXT,
      node_type      TEXT NOT NULL,
      label          TEXT NOT NULL,
      text_content   TEXT NOT NULL,
      status         TEXT DEFAULT 'active',
      struck_down_by TEXT,
      effective_from TEXT,
      effective_until TEXT,
      PRIMARY KEY (node_id, snapshot_id)
    );
    """)

    # Populate SQLite database
    # 1. Insert Act
    cursor.execute(
        "INSERT INTO acts (act_code, full_name, year, source_url) VALUES (?, ?, ?, ?)",
        ("CRPC-1973", "Code of Criminal Procedure, 1973", 1973, "https://indiacode.nic.in")
    )
    # 2. Insert Snapshot
    cursor.execute(
        "INSERT INTO act_snapshots (snapshot_id, act_code, version_label, pulled_at, source_url, is_current) VALUES (?, ?, ?, ?, ?, ?)",
        (f"CRPC-1973_{SNAPSHOT_ID}", "CRPC-1973", "v1", SNAPSHOT_ID, "https://indiacode.nic.in", 1)
    )
    # 3. Insert Nodes
    for node in nodes:
        cursor.execute(
            "INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES (?, ?, ?, ?, ?, ?)",
            (
                node["id"],
                f"CRPC-1973_{SNAPSHOT_ID}",
                node.get("parent_id"),
                node["type"],
                node["title"],
                node["text"]
            )
        )
    
    conn.commit()
    print("Local database populated successfully.")

    # Run verification queries
    cursor.execute("SELECT COUNT(*) FROM pageindex_nodes;")
    node_count = cursor.fetchone()[0]
    print(f"Total nodes inserted: {node_count}")

    cursor.execute("SELECT node_id, label FROM pageindex_nodes WHERE node_type = 'chapter' LIMIT 3;")
    print("Sample chapters:")
    for row in cursor.fetchall():
        print(f"  - {row[0]}: {row[1]}")

    cursor.execute("SELECT node_id, label FROM pageindex_nodes WHERE node_type = 'section' LIMIT 3;")
    print("Sample sections:")
    for row in cursor.fetchall():
        print(f"  - {row[0]}: {row[1]}")

    conn.close()
    print("\nLocal database verification complete!")

if __name__ == "__main__":
    main()
