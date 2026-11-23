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
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.css',
})
export class ComingSoonComponent {
  readonly title: string = inject(ActivatedRoute).snapshot.data['title'] ?? 'Page';
}
