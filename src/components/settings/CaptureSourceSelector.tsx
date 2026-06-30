import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Dropdown } from "../ui/Dropdown";
import { SettingContainer } from "../ui/SettingContainer";

type CaptureSource = "microphone" | "system" | "mixed";

interface AudioDevice {
  index: string;
  name: string;
  is_default: boolean;
}

interface CaptureSourceSelectorProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

const OPTIONS: { value: CaptureSource; label: string }[] = [
  { value: "microphone", label: "Microphone" },
  { value: "system", label: "System Audio" },
  { value: "mixed", label: "Mixed (beta)" },
];

export const CaptureSourceSelector: React.FC<CaptureSourceSelectorProps> =
  React.memo(({ descriptionMode = "tooltip", grouped = false }) => {
    const [source, setSource] = useState<CaptureSource>("microphone");
    const [systemDevice, setSystemDevice] = useState<string>("Default");
    const [systemDevices, setSystemDevices] = useState<AudioDevice[]>([]);
    const [busy, setBusy] = useState(false);

    const loadState = async () => {
      try {
        const [src, dev, devices] = await Promise.all([
          invoke<CaptureSource>("get_capture_source"),
          invoke<string>("get_selected_system_audio_device"),
          invoke<AudioDevice[]>("get_available_system_audio_devices"),
        ]);
        setSource(src);
        setSystemDevice(dev === "default" ? "Default" : dev);
        setSystemDevices(devices);
      } catch (e) {
        console.error("Failed to load capture source state:", e);
      }
    };

    useEffect(() => {
      loadState();
    }, []);

    const handleSourceChange = async (next: string) => {
      setBusy(true);
      try {
        await invoke("set_capture_source", { source: next });
        setSource(next as CaptureSource);
      } catch (e) {
        console.error("Failed to set capture source:", e);
      } finally {
        setBusy(false);
      }
    };

    const handleSystemDeviceChange = async (name: string) => {
      setBusy(true);
      try {
        const payload = name === "Default" ? "default" : name;
        await invoke("set_selected_system_audio_device", {
          deviceName: payload,
        });
        setSystemDevice(name);
      } catch (e) {
        console.error("Failed to set system audio device:", e);
      } finally {
        setBusy(false);
      }
    };

    const showSystemPicker = source === "system" || source === "mixed";

    return (
      <>
        <SettingContainer
          title="Capture Source"
          description="Choose what to transcribe: your mic, the audio playing on this PC (e.g. the person on a call), or both mixed together."
          descriptionMode={descriptionMode}
          grouped={grouped}
        >
          <div className="flex items-center space-x-1">
            <Dropdown
              options={OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              selectedValue={source}
              onSelect={handleSourceChange}
              disabled={busy}
              placeholder="Capture source"
            />
          </div>
        </SettingContainer>

        {showSystemPicker && (
          <SettingContainer
            title="System Audio Device"
            description="The output endpoint to record via loopback. Pick the device your call/app is playing through."
            descriptionMode={descriptionMode}
            grouped={grouped}
          >
            <div className="flex items-center space-x-1">
              <Dropdown
                options={systemDevices.map((d) => ({
                  value: d.name,
                  label: d.name,
                }))}
                selectedValue={systemDevice}
                onSelect={handleSystemDeviceChange}
                disabled={busy || systemDevices.length === 0}
                onRefresh={loadState}
                placeholder={
                  systemDevices.length === 0 ? "Loading..." : "Select device"
                }
              />
            </div>
          </SettingContainer>
        )}
      </>
    );
  });
