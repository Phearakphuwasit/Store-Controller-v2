import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {
  showSidebar: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateSidebar(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateSidebar(event.urlAfterRedirects);
      });
  }

  private updateSidebar(url: string) {
  // Extract the first part of the URL path
  const path = url.split('?')[0]; // remove query params
  const hideOn = ['/login', '/register'];
  
  this.showSidebar = !hideOn.includes(path);
}

}
