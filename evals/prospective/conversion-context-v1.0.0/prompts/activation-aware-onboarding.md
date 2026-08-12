/agora --no-voice Write a three-screen onboarding sequence for a budgeting app.

The activation event is the user's first successful bank-account sync. Before that sync, the app needs read-only bank access. Notifications are optional and can be requested after the first sync. The supplied bank-access explanation is: "The app reads balances and transactions. It cannot move money."

Return each screen's title, body, primary action, and optional secondary action. Keep the bank-access decision explicit. Do not optimize for permission acceptance or onboarding completion as if either were activation.
