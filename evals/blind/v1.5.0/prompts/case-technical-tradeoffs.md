Write a technical implementation case study.

Facts: an engineering team moved a nightly batch reconciliation job to an event-driven design. Alternatives considered were a larger batch window, incremental polling, and event streaming. They chose streaming because late records needed independent retry and traceability. The rollout used dual writes for two weeks. A malformed event caused a three-hour backlog during the pilot, leading to schema validation and a dead-letter queue. Median reconciliation delay fell from 11 hours to 18 minutes in the tested service. Infrastructure cost rose 22 percent. No business outcome was measured.

Audience: technical evaluators. Include alternatives, interfaces, rollout, failure, observed performance, cost, and limits.
