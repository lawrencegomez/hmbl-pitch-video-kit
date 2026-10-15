// Remotion CLI config (applies to `remotion render` / `remotion studio`).
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Each company's research + assets live in companies/<slug>/; staticFile('<slug>/...') resolves there.
Config.setPublicDir('./companies');
