# FocusAI — Smart Study Assistant

FocusAI is an AI-powered study assistant designed to help students maintain focus while studying.

The application uses the user's webcam to analyze facial and eye movements and detect signs of drowsiness or loss of attention. When the system detects that the user may be falling asleep, it can trigger a customizable alert sound.

The project combines **React, Node.js, Express.js, MongoDB, and Computer Vision** to create a practical AI-based productivity application.

---

## 🎯 Project Goal

The main goal of FocusAI is to create a smart study companion that can:

- 📷 Monitor the user's face through the webcam
- 👁️ Analyze eye movement and eye openness
- 😴 Detect possible drowsiness
- 🔊 Trigger an alert when drowsiness is detected
- 🎵 Allow users to select a custom alert sound
- ⏱️ Track study sessions
- 📊 Calculate an attention/focus score
- 📚 Store study history
- 📈 Provide useful statistics about study sessions

The project is also designed as a learning project for understanding how a frontend, backend, database, and AI/computer-vision system can work together.

---

# ✨ Features

## 📷 Webcam Monitoring

FocusAI uses the device's webcam to monitor the user's face during a study session.

Features include:

- Start/Stop camera controls
- Camera permission handling
- Camera error handling
- Mirrored webcam preview

---

## 👁️ Eye Tracking

The application uses facial landmarks to identify important points around the eyes.

These landmarks are used to calculate the **Eye Aspect Ratio (EAR)** and determine whether the user's eyes appear to be closed for a certain period.

This helps distinguish normal blinking from possible drowsiness.

---

## 😴 Drowsiness Detection

FocusAI continuously analyzes eye-related information while the user is studying.

If the user's eyes remain in a state associated with drowsiness for longer than the configured threshold, the application can trigger an alert.

The system is designed to avoid triggering an alert for normal short-duration blinking.

---

## 🔊 Custom Alert Sound

Users can choose their own alert sound.

Features include:

- Upload an audio file
- Store the selected sound
- Preview the sound
- Test the alert
- Adjust volume
- Use the sound when drowsiness is detected

---

## ⏱️ Study Timer

The application tracks the duration of a study session.

It can record:

- Session start time
- Session end time
- Total study duration
- Attentive duration
- Drowsy/distraction events

---

## 📊 Attention Score

FocusAI can calculate an attention score based on the amount of time the user remains attentive during a study session.

Example:

```text
Total Study Time: 60 minutes
Attentive Time:   52 minutes

Attention Score:  86.7%
