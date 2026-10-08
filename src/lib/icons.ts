// Phosphor icons, read as raw SVG at build time. Rendered once per page as a sprite (IconSprite.astro)
// and referenced with <use>, so 150 icons on the home page cost one copy of each path.
import appWindow from '@phosphor-icons/core/assets/regular/app-window.svg?raw';
import arrowLeft from '@phosphor-icons/core/assets/regular/arrow-left.svg?raw';
import arrowRight from '@phosphor-icons/core/assets/regular/arrow-right.svg?raw';
import arrowUpRight from '@phosphor-icons/core/assets/regular/arrow-up-right.svg?raw';
import arrowCounterClockwise from '@phosphor-icons/core/assets/regular/arrow-counter-clockwise.svg?raw';
import calculator from '@phosphor-icons/core/assets/regular/calculator.svg?raw';
import camera from '@phosphor-icons/core/assets/regular/camera.svg?raw';
import caretDown from '@phosphor-icons/core/assets/regular/caret-down.svg?raw';
import check from '@phosphor-icons/core/assets/regular/check.svg?raw';
import checkCircle from '@phosphor-icons/core/assets/regular/check-circle.svg?raw';
import clock from '@phosphor-icons/core/assets/regular/clock.svg?raw';
import cookie from '@phosphor-icons/core/assets/regular/cookie.svg?raw';
import drop from '@phosphor-icons/core/assets/regular/drop.svg?raw';
import envelope from '@phosphor-icons/core/assets/regular/envelope.svg?raw';
import houseLine from '@phosphor-icons/core/assets/regular/house-line.svg?raw';
import info from '@phosphor-icons/core/assets/regular/info.svg?raw';
import lampPendant from '@phosphor-icons/core/assets/regular/lamp-pendant.svg?raw';
import lightning from '@phosphor-icons/core/assets/regular/lightning.svg?raw';
import list from '@phosphor-icons/core/assets/regular/list.svg?raw';
import mapPin from '@phosphor-icons/core/assets/regular/map-pin.svg?raw';
import minus from '@phosphor-icons/core/assets/regular/minus.svg?raw';
import moon from '@phosphor-icons/core/assets/regular/moon.svg?raw';
import phone from '@phosphor-icons/core/assets/regular/phone.svg?raw';
import plus from '@phosphor-icons/core/assets/regular/plus.svg?raw';
import sun from '@phosphor-icons/core/assets/regular/sun.svg?raw';
import trash from '@phosphor-icons/core/assets/regular/trash.svg?raw';
import wall from '@phosphor-icons/core/assets/regular/wall.svg?raw';
import warning from '@phosphor-icons/core/assets/regular/warning.svg?raw';
import x from '@phosphor-icons/core/assets/regular/x.svg?raw';

export const icons = {
  'app-window': appWindow,
  'arrow-left': arrowLeft,
  'arrow-right': arrowRight,
  'arrow-up-right': arrowUpRight,
  'arrow-counter-clockwise': arrowCounterClockwise,
  calculator,
  camera,
  'caret-down': caretDown,
  check,
  'check-circle': checkCircle,
  clock,
  cookie,
  drop,
  envelope,
  'house-line': houseLine,
  info,
  'lamp-pendant': lampPendant,
  lightning,
  list,
  'map-pin': mapPin,
  minus,
  moon,
  phone,
  plus,
  sun,
  trash,
  wall,
  warning,
  x,
};

export type IconName = keyof typeof icons;

/** The paths inside a Phosphor file, without its outer <svg> element. */
export const iconBody = (name: IconName): string => icons[name].replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
