import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

/***************
 * Animation
 ***************/
export const Transform = trigger('display', [
  state(
    'display',
    style({
      display: 'block',
      transform: 'translate(0, 0)',
    }),
  ),
  state(
    'hidden',
    style({
      display: 'none',
    }),
  ),
  state(
    'hiddenLeftTop',
    style({
      display: 'none',
      transform: 'translate(-100%, -100%)',
    }),
  ),
  state(
    'hiddenLeftBottom',
    style({
      display: 'none',
      transform: 'translate(-100%, 100%)',
    }),
  ),
  state(
    'hiddenLeft',
    style({
      display: 'none',
      transform: 'translate(-100%, 0)',
    }),
  ),
  state(
    'hiddenRightTop',
    style({
      display: 'none',
      transform: 'translate(100%, -100%)',
    }),
  ),
  state(
    'hiddenRightBottom',
    style({
      display: 'none',
      transform: 'translate(100%, 100%)',
    }),
  ),
  state(
    'hiddenRight',
    style({
      display: 'none',
      transform: 'translate(100%, 0)',
    }),
  ),
  state(
    'hiddenTop',
    style({
      display: 'none',
      transform: 'translate(0, -100%)',
    }),
  ),
  state(
    'hiddenBottom',
    style({
      display: 'none',
      transform: 'translate(0, 100%)',
    }),
  ),
  transition('* => display', [animate('150ms ease-in')]),
  transition('display => hiddenLeftTop', [animate('150ms ease-in')]),
  transition('display => hiddenLeftBottom', [animate('150ms ease-in')]),
  transition('display => hiddenLeft', [animate('150ms ease-in')]),
  transition('display => hiddenRightTop', [animate('150ms ease-in')]),
  transition('display => hiddenRightBottom', [animate('150ms ease-in')]),
  transition('display => hiddenRight', [animate('150ms ease-in')]),
  transition('display => hiddenTop', [animate('150ms ease-in')]),
  transition('display => hiddenBottom', [animate('150ms ease-in')]),
]);
