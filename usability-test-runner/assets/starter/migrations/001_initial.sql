CREATE TABLE sessions (
 id TEXT PRIMARY KEY, alias TEXT NOT NULL, token_hash TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','stopped')),
 created_at TEXT NOT NULL, revision TEXT NOT NULL, variant TEXT NOT NULL, consent TEXT NOT NULL, consent_version TEXT NOT NULL,
 capture_incomplete INTEGER NOT NULL DEFAULT 0, frame_count INTEGER NOT NULL DEFAULT 0, point_count INTEGER NOT NULL DEFAULT 0,
 tree_bytes INTEGER NOT NULL DEFAULT 0, max_frames INTEGER NOT NULL,
 max_points INTEGER NOT NULL, max_tree_bytes INTEGER NOT NULL,
 CHECK(frame_count <= max_frames AND point_count <= max_points AND tree_bytes <= max_tree_bytes)
);
CREATE TABLE records (
 session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
 id TEXT NOT NULL, kind TEXT NOT NULL, task_id TEXT NOT NULL,
 attempt_id TEXT NOT NULL, seq INTEGER NOT NULL, data TEXT NOT NULL,
 PRIMARY KEY(session_id,id), UNIQUE(session_id,seq)
);
CREATE TABLE notes (
 session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
 task_id TEXT NOT NULL, verdict TEXT NOT NULL, note TEXT NOT NULL,
 author TEXT NOT NULL, at TEXT NOT NULL, PRIMARY KEY(session_id,task_id)
);
CREATE UNIQUE INDEX one_attempt_per_task ON records(session_id,task_id)
 WHERE kind='event' AND json_extract(data,'$.type')='task_started';
CREATE UNIQUE INDEX one_result_per_attempt ON records(session_id,attempt_id) WHERE kind='result';
CREATE INDEX records_by_task ON records(kind,task_id,session_id,seq);
CREATE INDEX records_by_frame ON records(session_id,kind,json_extract(data,'$.frameId'));
CREATE INDEX sessions_by_date ON sessions(created_at);

CREATE TRIGGER active_session_writes BEFORE INSERT ON records
WHEN NOT EXISTS (SELECT 1 FROM sessions WHERE id=NEW.session_id AND status='active')
BEGIN SELECT RAISE(ABORT,'SESSION_CLOSED'); END;
CREATE TRIGGER answered_attempt_events BEFORE INSERT ON records
WHEN NEW.kind='event' AND EXISTS (
 SELECT 1 FROM records WHERE session_id=NEW.session_id AND attempt_id=NEW.attempt_id AND kind='result'
)
BEGIN SELECT RAISE(ABORT,'ATTEMPT_CLOSED'); END;

CREATE TRIGGER partial_capture_result AFTER INSERT ON records
WHEN NEW.kind='result' AND json_extract(NEW.data,'$.captureIncomplete')=1
BEGIN UPDATE sessions SET capture_incomplete=1 WHERE id=NEW.session_id; END;
