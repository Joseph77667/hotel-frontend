import { Component, Input } from '@angular/core';

/**
 * Title + subtitle at the top of each page, with buttons on the right.
 *
 *   <app-page-header title="Amenities" subtitle="...">
 *     <button mat-flat-button>Add</button>
 *   </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div>
        <h1>{{ title }}</h1>
        @if (subtitle) {
          <p>{{ subtitle }}</p>
        }
      </div>
      <div class="actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .page-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 20px;
    }
    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1e3a5f;
    }
    p {
      margin: 4px 0 0;
      color: #666;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
  `,
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
}
