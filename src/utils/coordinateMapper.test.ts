/**
 * Минимальные node-tests для coordinateMapper. Запуск:
 *   node --import tsx src/utils/coordinateMapper.test.ts
 * (или подключите vitest в package.json при необходимости).
 */

import {
  fitFrameIntoRect,
  getDisplayedRect,
  mapClientPointToVdiCoords,
  mapDragRectToVdiBBox,
  mapVdiCoordsToScreenPoint,
} from "./coordinateMapper";

type FakeImg = {
  naturalWidth: number;
  naturalHeight: number;
  getBoundingClientRect: () => { left: number; top: number; width: number; height: number };
};

function fake(rect: { left: number; top: number; width: number; height: number }, nat: { w: number; h: number }): HTMLImageElement {
  const f: FakeImg = {
    naturalWidth: nat.w,
    naturalHeight: nat.h,
    getBoundingClientRect: () => rect,
  };
  return f as unknown as HTMLImageElement;
}

let ok = 0;
let fail = 0;
function assert(name: string, cond: boolean, extra?: unknown) {
  if (cond) {
    ok++;
    console.log("  ok  -", name);
  } else {
    fail++;
    console.error("  FAIL-", name, extra ?? "");
  }
}

// 0. fit helper должен повторять contain-геометрию отдельно от DOM
{
  const fitted = fitFrameIntoRect({ left: 0, top: 0, width: 1000, height: 1000 }, { width: 1920, height: 1080 });
  assert("fit helper width = full", Math.round(fitted.width) === 1000, fitted);
  assert("fit helper centers vertically", Math.round(fitted.top) === 219, fitted);
}

// 1. exact-fit (без letterbox): 1920x1080 рендерится как 1280x720
{
  const img = fake({ left: 100, top: 50, width: 1280, height: 720 }, { w: 1920, h: 1080 });
  const frame = { width: 1920, height: 1080 };
  const p = mapClientPointToVdiCoords(100 + 640, 50 + 360, img, frame)!;
  assert("exact-fit center", p.x === 960 && p.y === 540, p);
  const r = getDisplayedRect(img, frame);
  assert("displayed rect = bounding rect", r.width === 1280 && r.height === 720);
}

// 2. letterbox по бокам (контейнер шире кадра)
{
  const img = fake({ left: 0, top: 0, width: 2000, height: 1000 }, { w: 1920, h: 1080 });
  const frame = { width: 1920, height: 1080 };
  const r = getDisplayedRect(img, frame);
  // ratio frame=1.777, container=2 → letterbox по бокам
  assert("letterbox sides height", Math.round(r.height) === 1000);
  assert("letterbox sides width < container", r.width < 2000);
  // клик в самый центр контейнера должен быть центром VDI
  const p = mapClientPointToVdiCoords(1000, 500, img, frame)!;
  assert("center click → VDI center", p.x === 960 && p.y === 540, p);
  // клик в left=0 (в letterbox) → null
  const out = mapClientPointToVdiCoords(0, 500, img, frame);
  assert("letterbox click → null", out === null);
}

// 3. letterbox сверху-снизу (контейнер выше кадра)
{
  const img = fake({ left: 0, top: 0, width: 1000, height: 1000 }, { w: 1920, h: 1080 });
  const frame = { width: 1920, height: 1080 };
  const r = getDisplayedRect(img, frame);
  assert("letterbox top width = full", Math.round(r.width) === 1000);
  assert("letterbox top height < container", r.height < 1000);
  const p = mapClientPointToVdiCoords(500, 500, img, frame)!;
  assert("center click VDI center", p.x === 960 && p.y === 540, p);
}

// 4. drag rect
{
  const img = fake({ left: 0, top: 0, width: 1280, height: 720 }, { w: 1920, h: 1080 });
  const bbox = mapDragRectToVdiBBox({ x1: 0, y1: 0, x2: 640, y2: 360 }, img, { width: 1920, height: 1080 });
  assert("drag rect maps", !!bbox && bbox.w === 960 && bbox.h === 540, bbox);
}

// 5. round-trip
{
  const img = fake({ left: 100, top: 100, width: 1280, height: 720 }, { w: 1920, h: 1080 });
  const screen = mapVdiCoordsToScreenPoint({ x: 960, y: 540 }, img, { width: 1920, height: 1080 });
  assert("VDI → screen", Math.round(screen.clientX) === 740 && Math.round(screen.clientY) === 460, screen);
}

console.log(`\nresult: ${ok} ok, ${fail} failed`);
if (fail > 0) (globalThis as { process?: { exit: (n: number) => void } }).process?.exit(1);
