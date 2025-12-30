import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  path: string;
  badge?: number;
  icon?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  inventoryMenu: MenuItem[] = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Products', path: '/inventory/products', badge: 12 },
    { label: 'Categories', path: '/inventory/categories' },
    { label: 'Stock Levels', path: '/inventory/stock' },
  ];

  logisticsMenu: MenuItem[] = [
    { label: 'Purchase Orders', path: '/logistics/purchase-orders' },
    { label: 'Deliveries', path: '/logistics/deliveries' },
    { label: 'Returns', path: '/logistics/returns', icon: `<svg class="w-5 h-5" ...></svg>` },
  ];

  reportMenu: MenuItem[] = [
    { label: 'Sales Report', path: '/reports/sales' },
    { label: 'Inventory Report', path: '/reports/inventory' },
  ];
}
