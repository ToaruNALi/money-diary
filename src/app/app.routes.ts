import { Routes } from '@angular/router';
import { InternalServerErrorComponent } from 'src/app/core/internal-server-error/internal-server-error.component';
import { PageNotFoundComponent } from 'src/app/core/page-not-found/page-not-found.component';
import { MoneyDiaryPageComponent } from 'src/app/features/money-diary/money-diary.page';
import { CheckComponent } from 'src/app/features/test/check/check.component';
import { TestComponent } from 'src/app/features/test/test/test.component';
import * as Const from 'src/app/shared/constants/constants';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: Const.ROUTE_PATH.MAIN,
  },
  {
    path: Const.ROUTE_PATH.MAIN,
    component: MoneyDiaryPageComponent,
  },
  {
    path: Const.ROUTE_PATH.ERR,
    component: InternalServerErrorComponent,
  },
  {
    // テスト用
    path: 'test',
    component: TestComponent,
  },
  {
    // テスト用
    path: 'check',
    component: CheckComponent,
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
