import sqlite3

conn = sqlite3.connect("skinAI.db")
cursor = conn.cursor()

cursor.execute("""
SELECT name
FROM sqlite_master
WHERE type='table'
""")

tables = cursor.fetchall()

print("\nDATABASE: skinAI.db")
print("\nTABLES:")

for table in tables:
    table_name = table[0]
    print("\n---", table_name, "---")

    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()

    for row in rows:
        print(row)

conn.close()