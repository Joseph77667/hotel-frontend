import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';

import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

/**
 * Usage:
 *   this.confirm.ask({ title: 'Delete', message: 'Are you sure?', danger: true })
 *     .subscribe(ok => { if (ok) { ... } });
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(MatDialog);

  ask(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px', autoFocus: false })
      .afterClosed()
      .pipe(map((result) => result === true));
  }
}
