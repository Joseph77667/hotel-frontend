import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';

/**
 * Temporary page for menu items not built yet.
 * Lets you test the menu and role guards now; each route is replaced
 * by the real feature component later.
 */
@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="coming-soon">
      <mat-icon>construction</mat-icon>
      <h2>{{ title }}</h2>
      <p>This page is coming soon.</p>
    </div>
  `,
  styles: `
    .coming-soon {
      text-align: center;
      padding: 64px 16px;
      color: #666;
    }
    mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: #9aa9bb;
    }
    h2 {
      margin: 12px 0 4px;
      color: #1e3a5f;
    }
  `,
})
export class ComingSoonComponent {
  readonly title: string = inject(ActivatedRoute).snapshot.data['title'] ?? 'Page';
}
