import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  showSidebar: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initial check
    this.updateSidebar(this.router.url);

    // Subscribe to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateSidebar(event.urlAfterRedirects);
      });
  }

  private updateSidebar(url: string) {
    // Use bracket notation to satisfy TypeScript
    const currentRoute = this.router.routerState.root.firstChild?.snapshot.data;
    this.showSidebar = !(currentRoute && currentRoute['hideSidebar']);
  }
}
