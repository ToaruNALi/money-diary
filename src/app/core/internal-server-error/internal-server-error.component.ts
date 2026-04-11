import { Component } from '@angular/core';

@Component({
  selector: 'app-internal-server-error',
  templateUrl: './internal-server-error.component.html',
  styleUrl: './internal-server-error.component.scss',
})
export class InternalServerErrorComponent {
  protected readonly errInf = {
    code: '500',
    msg: 'Internal Server Error',
  } as const;
}
