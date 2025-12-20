# **App Name**: NeuroBlock Rehab

## Core Features:

- Hand Movement Tracking: Utilize MediaPipe and OpenCV to track 2-3 basic hand rehabilitation movements (hand open/close, wrist flexion, finger pinch) via camera-based pose estimation.
- AI-assisted Clinical Reasoning: Employ the Gemini API to explain the quality of hand movements based on the tracked data, using range of motion (%), stability (tremor / variance), and completion accuracy as explicit metrics. The system will act as a tool to reason about whether to incorporate specific feedback or suggestions.
- Blockchain Integration: Record timestamps, movement accuracy scores, and a session hash to an immutable blockchain ledger for tamper-proof storage of patient progress data.
- Doctor Dashboard: Provide a doctor dashboard with a progress timeline, session comparison, and report download options.
- Data Access Control: Implement patient-controlled data access, ensuring doctors can only view data with explicit patient permission.
- Secure Data Storage: Implement mechanism for Secure Storage of non-hashed data
- Recovery Trend Score (RTS): Compute a simple Recovery Trend Score based on the last N sessions, stored on the blockchain per session, to show measurable progress over time (RTS ↑ = improving motor control, RTS ↓ = stagnation / regression).
- Flag for Review: Implement a 'Flag for Review' button, allowing doctors to flag abnormal recovery patterns, logged on the blockchain, enabling remote intervention and global doctor collaboration.

## Style Guidelines:

- Primary color: Calming blue (#64B5F6) to promote trust and reliability.
- Background color: Light gray-blue (#ECEFF1), a very low saturation of the primary, to create a neutral and professional backdrop.
- Accent color: Soft green (#A5D6A7) for positive reinforcement and highlighting progress.
- Body and headline font: 'Inter', a grotesque-style sans-serif with a modern look, is used to give a neutral and objective feel that suits both headlines and body text.
- Use clear, intuitive icons to represent different movements and data points.
- Design a clean, modular layout for both doctor and patient dashboards, prioritizing data clarity and ease of navigation.
- Incorporate a progress ring animation after each session, color-coded to represent recovery: Green = improvement, Yellow = stable, Red = decline.