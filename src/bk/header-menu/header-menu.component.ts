// import { Component, EventEmitter, OnInit, Output } from '@angular/core';
// import { HeaderMenuType } from 'src/app/bk/domain/header-menu.type';
// import HeaderMenuJson from '../../../assets/def/header-menu.json';

// @Component({
//   selector: 'app-header-menu',
//   template: `
//     <div class="header-menu-background" (click)="onHeaderMenuClosed()"></div>
//     <div class="header-menu-field">
//       <div class="header-menu-item" *ngFor="let item of def.items">
//         <a
//           class="label"
//           [routerLink]="item.route"
//           [skipLocationChange]="true"
//           (click)="onHeaderMenuClosed()"
//           >{{ item.label }}</a
//         >
//       </div>
//     </div>
//   `,
//   styles: `
//     .header-menu-background {
//       position: fixed;
//       top: 0px;
//       left: 0;
//       width: 100%;
//       height: 100%;
//       background-color: #00000080;
//     }

//     .header-menu-field {
//       display: block;
//       position: absolute;
//       top: 50px;
//       left: 0;
//       width: 200px;
//       height: 100vh;
//       background-color: #303030e0;
//       padding: 40px 0 0 40px;
//     }

//     .header-menu-item {
//       margin-bottom: 20px;
//     }

//     .label {
//       color: #ffffff;
//     }
//   `,
// })
// export class HeaderMenuComponent implements OnInit {
//   /** ヘッダメニューデフォルトタイトル */
//   private static readonly DEFAULT_TITLE = 'HEADER MENU';

//   @Output() closeMenu: EventEmitter<void>;

//   /** タイトル */
//   title: string = '';
//   /** ヘッダメニュー 定義 */
//   def!: HeaderMenuType;

//   constructor() {
//     this.closeMenu = new EventEmitter();
//   }

//   ngOnInit(): void {
//     // 定義取得
//     this.def = this.getHeaderMenu();

//     // タイトル設定
//     this.title = this.def.label || HeaderMenuComponent.DEFAULT_TITLE;
//   }

//   private getHeaderMenu = (): HeaderMenuType => {
//     return HeaderMenuJson as HeaderMenuType;
//   };

//   onHeaderMenuClosed = (): void => {
//     this.closeMenu.emit();
//   };
// }
