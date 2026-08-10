Write two explanations of the same technical fact: one for the general public and one for database engineers.

Fact set: a write-ahead log records a change before the database page is updated. After a crash, the system uses durable log records to redo committed changes and undo or ignore incomplete work according to the database's recovery design. Exact behavior differs by database engine.

The public version must preserve the sequence without unnecessary terms. The expert version may use standard database terminology and must state the engine-dependent boundary. Do not use an analogy unless it improves the explanation.
