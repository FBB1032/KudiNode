import { Audio } from "expo-av";

export const WHISPER_RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: ".m4a",
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 48000,
  },
  ios: {
    extension: ".m4a",
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 48000,
    linearPCMBitDepth: 16,
    audioQuality: Audio.IOSAudioQuality.HIGH,
  },
  web: {
    mimeType: "audio/mp4",
    bitsPerSecond: 48000,
  },
};

export type VoiceLanguage = "en" | "ha" | "yo" | "ig" | "pid" | "auto";

export const LANG_OPTIONS: { label: string; value: VoiceLanguage }[] = [
  { label: "EN", value: "en" },
  { label: "HA", value: "ha" },
  { label: "YO", value: "yo" },
  { label: "IG", value: "ig" },
  { label: "PID", value: "pid" },
  { label: "AUTO", value: "auto" },
];
