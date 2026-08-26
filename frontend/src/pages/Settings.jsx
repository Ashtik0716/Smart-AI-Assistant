import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../services/api";

/**
 * Loads current settings from the backend on mount, lets the user
 * edit them locally, and saves back via PUT /api/settings on submit.
 * These are the same values Camera.jsx will use for detection,
 * once we wire that up next.
 */
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

  if (loading) return <div className="p-6 text-center text-gray-500">Loading settings...</div>;
  if (error && !settings) return <div className="p-6 text-center text-red-600">Failed to load settings: {error}</div>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Settings</h2>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Eye-Closure Threshold ({settings.earThreshold.toFixed(2)})
          </label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={settings.earThreshold}
            onChange={(e) => handleChange("earThreshold", parseFloat(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Higher = more sensitive (may false-trigger). Lower = less sensitive.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Drowsiness Duration ({(settings.drowsyDurationMs / 1000).toFixed(1)}s)
          </label>
          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            value={settings.drowsyDurationMs}
            onChange={(e) => handleChange("drowsyDurationMs", parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            How long eyes must stay closed before triggering an alert.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alert Volume ({Math.round(settings.alertVolume * 100)}%)
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.alertVolume}
            onChange={(e) => handleChange("alertVolume", parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.alertsEnabled}
            onChange={(e) => handleChange("alertsEnabled", e.target.checked)}
          />
          Enable drowsiness alerts
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.headPoseEnabled}
            onChange={(e) => handleChange("headPoseEnabled", e.target.checked)}
          />
          Enable head-pose detection (experimental)
        </label>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-gray-300"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>

        {savedMessage && <p className="text-sm text-green-600 text-center">Settings saved ✅</p>}
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </form>
    </div>
  );
}