import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { ProductsComponent } from './pages/inventory/products/products.component';
import { CategoriesComponent } from './pages/inventory/categories/categories.component';
import { StockLevelsComponent } from './pages/inventory/stock-levels/stock-levels.component';
import { PurchaseOrdersComponent } from './pages/logistics/purchase-orders/purchase-orders.component';
import { DeliveriesComponent } from './pages/logistics/deliveries/deliveries.component';
import { ReturnsComponent } from './pages/logistics/returns/returns.component';
import { SalesReportComponent } from './pages/reports/sales-report/sales-report.component';
import { InventoryReportComponent } from './pages/reports/inventory-report/inventory-report.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Auth (no sidebar)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Admin / Main (protected)
  { path: 'dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },

  // Inventory
  { path: 'inventory/products', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'inventory/categories', component: CategoriesComponent, canActivate: [AuthGuard] },
  { path: 'inventory/stock', component: StockLevelsComponent, canActivate: [AuthGuard] },

  // Logistics
  { path: 'logistics/purchase-orders', component: PurchaseOrdersComponent, canActivate: [AuthGuard] },
  { path: 'logistics/deliveries', component: DeliveriesComponent, canActivate: [AuthGuard] },
  { path: 'logistics/returns', component: ReturnsComponent, canActivate: [AuthGuard] },

  // Reports
  { path: 'reports/sales', component: SalesReportComponent, canActivate: [AuthGuard] },
  { path: 'reports/inventory', component: InventoryReportComponent, canActivate: [AuthGuard] },

  // Profile
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  // Default redirect
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Wildcard redirect
  { path: '**', redirectTo: 'dashboard' },
];
