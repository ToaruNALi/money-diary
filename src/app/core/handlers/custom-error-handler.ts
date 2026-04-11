import { inject, Injectable } from '@angular/core';
import { NavigationError, Router } from '@angular/router';

@Injectable()
export class CustomErrorHandler {
  private readonly router = inject(Router);

  readonly handle = (err: NavigationError): Promise<boolean> => {
    console.log(`NavigationError: ${err}`);

    return this.router.navigate([`/error`], {
      skipLocationChange: true,
    });
  };
}
