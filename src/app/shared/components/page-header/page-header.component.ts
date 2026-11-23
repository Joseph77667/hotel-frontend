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
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
}
