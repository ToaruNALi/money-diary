import { inject, Injectable } from '@angular/core';
import { NavigationError, Router } from '@angular/router';
import * as Const from 'src/app/shared/constants/constants';

@Injectable()
export class CustomErrorHandler {
  private readonly router = inject(Router);

  readonly handle = (err: NavigationError): Promise<boolean> => {
    console.log(`NavigationError: ${err}`);

    return this.router.navigate([`/${Const.ROUTE_PATH.ERROR}`], {
      skipLocationChange: true,
    });
  };
}
