import { Component, Input } from '@angular/core';

import { toLabel } from '../../utils/labels';

/**
 * Coloured label for any status from the backend:
 * room (AVAILABLE...), reservation (CHECKED_IN...) or payment (REFUNDED...).
 *
 *   <app-status-badge [status]="room.status" />
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
})
export class StatusBadgeComponent {
  @Input({ required: true }) status = '';

  get label(): string {
    return toLabel(this.status);
  }

  /** "CHECKED_IN" → "status-checked-in" */
  get cssClass(): string {
    return 'status-' + this.status.toLowerCase().replace(/_/g, '-');
  }
}
