import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { NAV_ITEMS } from '../../layout/main-layout/nav-items';

/**
 * First page after login. For now it greets the user and shows shortcuts
 * for their role; later it gets today's arrivals, departures and room counts.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.currentUser;

  readonly shortcuts = computed(() => {
    const role = this.auth.role();
    return role
      ? NAV_ITEMS.filter((item) => item.route !== '/dashboard' && item.roles.includes(role))
      : [];
  });

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });
}
