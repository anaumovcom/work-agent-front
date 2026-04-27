import { OverlayToggles } from "../components/vdi/OverlayToggles";
import { VdiScreen } from "../components/vdi/VdiScreen";
import type { Mode, Point, Zone } from "../types";

interface Overlays {
  ocr: boolean;
  ui: boolean;
  zones: boolean;
  target: boolean;
  lastActions: boolean;
}

interface Props {
  mode: Mode;
  overlays: Overlays;
  onOverlaysChange: (o: Overlays) => void;
  lastClick: Point | null;
  selectedZone: Zone | null;
  vdiFocused: boolean;
  onVdiFocus: () => void;
  onVdiBlur: () => void;
  onClick: (p: Point) => void;
  onZoneSelected: (z: Zone) => void;
  onScroll: () => void;
  onVdiKey: (key: string) => void;
}

export function VdiControlScreen(props: Props) {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">VDI Control</h1>
          <div className="text-xs text-slate-500">
            Управление VDI экраном и взаимодействие с агентами
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          Режим: <span className="text-cyan-700 font-medium">{props.mode}</span>
          {props.vdiFocused && (
            <span className="ml-2 rounded bg-cyan-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
              ввод → VDI
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <OverlayToggles value={props.overlays} onChange={props.onOverlaysChange} />
      </div>

      <div className="flex-1 min-h-0">
        <VdiScreen
          overlays={props.overlays}
          lastClick={props.lastClick}
          selectedZone={props.selectedZone}
          focused={props.vdiFocused}
          onFocus={props.onVdiFocus}
          onBlur={props.onVdiBlur}
          onClick={props.onClick}
          onZoneSelected={props.onZoneSelected}
          onScroll={props.onScroll}
          onKey={props.onVdiKey}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
        <span className="font-medium text-slate-800">Подсказка:</span> кликните по экрану VDI,
        чтобы перенаправить ввод с клавиатуры в VDI. Нажмите Esc или кликните вне VDI,
        чтобы вернуть фокус. Для общения с агентом используйте чат справа.
      </div>
    </div>
  );
}
