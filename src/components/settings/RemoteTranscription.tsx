import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppSettings } from "@/bindings";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { Input } from "../ui/Input";
import { SettingContainer } from "../ui/SettingContainer";
import { useSettings } from "../../hooks/useSettings";

interface RemoteTranscriptionProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

type TextKey =
  | "remote_stt_base_url"
  | "remote_stt_api_key"
  | "remote_stt_model";

/** Text field that saves on blur, like the post-processing base URL field. */
const SavedOnBlurField: React.FC<{
  settingKey: TextKey;
  i18nKey: "baseUrl" | "apiKey" | "model";
  type?: "text" | "password";
  descriptionMode: "inline" | "tooltip";
  grouped: boolean;
}> = ({ settingKey, i18nKey, type = "text", descriptionMode, grouped }) => {
  const { t } = useTranslation();
  const { getSetting, updateSetting, isUpdating } = useSettings();
  const saved = (getSetting(settingKey) as AppSettings[TextKey]) ?? "";
  const [value, setValue] = useState(saved);

  useEffect(() => setValue(saved), [saved]);

  return (
    <SettingContainer
      title={t(`settings.advanced.remoteStt.${i18nKey}.title`)}
      description={t(`settings.advanced.remoteStt.${i18nKey}.description`)}
      descriptionMode={descriptionMode}
      grouped={grouped}
      layout="horizontal"
    >
      <Input
        type={type}
        value={value}
        autoComplete="off"
        spellCheck={false}
        placeholder={t(`settings.advanced.remoteStt.${i18nKey}.placeholder`)}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => {
          if (value.trim() !== saved) updateSetting(settingKey, value.trim());
        }}
        disabled={isUpdating(settingKey)}
        variant="compact"
        className="min-w-[320px]"
      />
    </SettingContainer>
  );
};

export const RemoteTranscription: React.FC<RemoteTranscriptionProps> =
  React.memo(({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const { getSetting, updateSetting, isUpdating } = useSettings();
    const enabled = getSetting("remote_stt_enabled") ?? false;

    return (
      <>
        <ToggleSwitch
          checked={enabled}
          onChange={(value) => updateSetting("remote_stt_enabled", value)}
          isUpdating={isUpdating("remote_stt_enabled")}
          label={t("settings.advanced.remoteStt.label")}
          description={t("settings.advanced.remoteStt.description")}
          descriptionMode={descriptionMode}
          grouped={grouped}
        />
        {enabled && (
          <>
            <SavedOnBlurField
              settingKey="remote_stt_base_url"
              i18nKey="baseUrl"
              descriptionMode={descriptionMode}
              grouped={grouped}
            />
            <SavedOnBlurField
              settingKey="remote_stt_api_key"
              i18nKey="apiKey"
              type="password"
              descriptionMode={descriptionMode}
              grouped={grouped}
            />
            <SavedOnBlurField
              settingKey="remote_stt_model"
              i18nKey="model"
              descriptionMode={descriptionMode}
              grouped={grouped}
            />
          </>
        )}
      </>
    );
  });
