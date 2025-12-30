import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

// Pages
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

const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent, data: { hideSidebar: true } },
  { path: 'register', component: RegisterComponent, data: { hideSidebar: true } },

  // Protected routes
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'inventory/products', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'inventory/categories', component: CategoriesComponent, canActivate: [AuthGuard] },
  { path: 'inventory/stock', component: StockLevelsComponent, canActivate: [AuthGuard] },
  { path: 'logistics/purchase-orders', component: PurchaseOrdersComponent, canActivate: [AuthGuard] },
  { path: 'logistics/deliveries', component: DeliveriesComponent, canActivate: [AuthGuard] },
  { path: 'logistics/returns', component: ReturnsComponent, canActivate: [AuthGuard] },
  { path: 'reports/sales', component: SalesReportComponent, canActivate: [AuthGuard] },
  { path: 'reports/inventory', component: InventoryReportComponent, canActivate: [AuthGuard] },

  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
