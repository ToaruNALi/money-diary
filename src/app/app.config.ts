import {
  ApplicationConfig,
  inject,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  NativeDateAdapter,
  provideNativeDateAdapter,
} from '@angular/material/core';
import {
  NavigationError,
  provideRouter,
  withHashLocation,
  withNavigationErrorHandler,
} from '@angular/router';
import { routes } from 'src/app/app.routes';
import { CustomErrorHandler } from 'src/app/core/handlers/custom-error-handler';

class MyDateAdapter extends NativeDateAdapter {
  /**
   * カレンダー日付返却
   * @description 1日,2日,3日,... → 1,2,3,...
   * @returns
   */
  override getDateNames(): string[] {
    return [...Array(31).keys()].map((i) => String(i + 1));
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withNavigationErrorHandler((err: NavigationError) =>
        inject(CustomErrorHandler).handle(err),
      ), // エラー設定
      withHashLocation(), // サーバ上でリロードした際の Not Found にならない対策
    ),
    provideZonelessChangeDetection(), // Zone Less
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: MyDateAdapter }, // カレンダー日付表記修正
    { provide: MAT_DATE_LOCALE, useValue: 'ja-JP' }, // カレンダー表記日本語化
  ],
};
