import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../services/api";

function SliderField({ id, label, display, hint, ...range }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-medium">
        <label htmlFor={id}>{label}</label>
        <span className="text-mist">{display}</span>
      </div>
      <input id={id} type="range" className="mt-3 w-full accent-brand" {...range} />
      {hint && <p className="mt-1.5 text-xs text-mist">{hint}</p>}
    </div>
  );
}

function ToggleField({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-0.5 h-4 w-4 accent-brand" />
      <span>
        {label}
        <span className="mt-0.5 block text-xs text-mist">{hint}</span>
      </span>
    </label>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSavedMessage(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setSavedMessage(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-mist">Loading settings…</div>;
  if (error && !settings) {
    return <div className="p-6 text-center text-red-400">Couldn’t load settings: {error}</div>;
  }

  return (
    <div className="panel mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-mist">Tune how FocusAI decides that you’re drowsy.</p>

      <form onSubmit={handleSave} className="mt-6 flex flex-col gap-6">
        <SliderField
          id="threshold"
          label="Eye-closure threshold"
          display={settings.earThreshold.toFixed(2)}
          hint="Lower is more sensitive and may trigger when you squint. Higher needs your eyes closed more fully."
          min="0.1"
          max="0.9"
          step="0.05"
          value={settings.earThreshold}
          onChange={(e) => handleChange("earThreshold", parseFloat(e.target.value))}
        />

        <SliderField
          id="duration"
          label="Drowsiness duration"
          display={`${(settings.drowsyDurationMs / 1000).toFixed(1)}s`}
          hint="How long your eyes must stay closed before the alarm plays."
          min="500"
          max="5000"
          step="100"
          value={settings.drowsyDurationMs}
          onChange={(e) => handleChange("drowsyDurationMs", parseInt(e.target.value, 10))}
        />

        <SliderField
          id="volume"
          label="Alert volume"
          display={`${Math.round(settings.alertVolume * 100)}%`}
          min="0"
          max="1"
          step="0.05"
          value={settings.alertVolume}
          onChange={(e) => handleChange("alertVolume", parseFloat(e.target.value))}
        />

        <ToggleField
          label="Enable drowsiness alerts"
          hint="Turn off to pause drowsiness detection and the alarm."
          checked={settings.alertsEnabled}
          onChange={(e) => handleChange("alertsEnabled", e.target.checked)}
        />

        <ToggleField
          label="Enable head-pose detection"
          hint="Also counts a forward head droop as eyes closed. Experimental."
          checked={settings.headPoseEnabled}
          onChange={(e) => handleChange("headPoseEnabled", e.target.checked)}
        />

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-brand px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:bg-ink-700 disabled:text-mist"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>

        {savedMessage && (
          <p role="status" className="text-center text-sm text-emerald-400">
            Settings saved
          </p>
        )}
        {error && (
          <p role="alert" className="text-center text-sm text-red-400">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}