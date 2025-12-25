from fastapi import FastAPI
from pydantic import BaseModel
import hashlib, time, sqlite3

app = FastAPI()

conn = sqlite3.connect("ledger.db", check_same_thread=False)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hash TEXT,
  timestamp TEXT
)
""")
conn.commit()

class MotionData(BaseModel):
    patient_id: str
    movement_scores: dict

def generate_hash(data: str):
    return hashlib.sha256(data.encode()).hexdigest()

@app.post("/record")
def record(data: MotionData):
    payload = f"{data.patient_id}-{data.movement_scores}"
    hashed = generate_hash(payload)
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

    cur.execute(
        "INSERT INTO ledger (hash, timestamp) VALUES (?, ?)",
        (hashed, timestamp)
    )
    conn.commit()

    return {"hash": hashed, "timestamp": timestamp}

@app.get("/history")
def history():
    cur.execute("SELECT * FROM ledger")
    rows = cur.fetchall()

    return [
        {"id": r[0], "hash": r[1], "timestamp": r[2]}
        for r in rows
    ]

