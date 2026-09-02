/agora --no-voice Write a technical API reference section. The audience is backend engineers.

Required behavior and exact terms:
- `POST /v1/jobs` accepts JSON with `source_url` and `callback_url`.
- A valid request returns `202 Accepted` with `job_id`.
- A missing `source_url` returns `400 Bad Request`.
- `GET /v1/jobs/{job_id}` returns `queued`, `running`, `complete`, or `failed`.
- Completed job records remain available for 24 hours, then return `404 Not Found`.
- A `202 Accepted` response does not mean processing completed.

Return only a heading, request/response behavior, and one warning about `202 Accepted`. Preserve endpoints, field names, status codes, state names, and retention exactly. Do not invent authentication, retry behavior, rate limits, payload fields, or timing.
