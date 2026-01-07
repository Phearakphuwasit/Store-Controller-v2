import { Component, Input, HostListener, inject, ChangeDetectorRef, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './export-button.component.html',
})
export class ExportButtonComponent {
  @Input() data: any[] = [];
  @Input() fileName: string = 'inventory-report';

  private cd = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private eRef = inject(ElementRef); 
  private alertService = inject(AlertService);

  private baseUrl = 'http://localhost:5000/api/auth';
  isOpen = false;

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    this.cd.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.eRef.nativeElement.contains(target)) {
      this.isOpen = false;
      this.cd.markForCheck();
    }
  }

  private logExportToServer() {
    this.http.post(`${this.baseUrl}/export-log`, {}).subscribe({
      next: () => console.log('Export logged successfully'),
      error: (err) => console.error('Failed to log export', err),
    });
    
    this.http.get(`${this.baseUrl}/export-inventory`).subscribe();
  }

  exportCSV() {
    if (!this.data?.length) {
      this.alertService.show('No data available to export', 'warning');
      return;
    }

    this.alertService.show('Generating CSV...', 'info');
    const headers = ['Name', 'Category', 'Price', 'Stock', 'Status'];
    const rows = this.data.map((p) => [
      `"${p.name?.replace(/"/g, '""')}"`,
      `"${(typeof p.category === 'object' ? p.category.name : p.category) || ''}"`,
      p.price,
      p.stock,
      p.stock < 10 ? 'Low Stock' : 'In Stock',
    ]);

    const content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadFile(content, 'text/csv', 'csv');
    this.logExportToServer();
  }

  exportExcel() {
    if (!this.data?.length) return;

    this.alertService.show('Preparing Excel file...', 'info');
    let xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">`;
    xml += `<Styles><Style ss:ID="s1"><Font ss:Bold="1"/></Style></Styles>`;
    xml += `<Worksheet name="Inventory"><Table>`;
    xml += `<Row ss:StyleID="s1"><Cell><Data Type="String">Name</Data></Cell><Cell><Data Type="String">Category</Data></Cell><Cell><Data Type="String">Stock</Data></Cell></Row>`;

    this.data.forEach((p) => {
      const cat = typeof p.category === 'object' ? p.category.name : p.category;
      xml += `<Row><Cell><Data Type="String">${p.name}</Data></Cell><Cell><Data Type="String">${cat}</Data></Cell><Cell><Data Type="Number">${p.stock}</Data></Cell></Row>`;
    });

    xml += `</Table></Worksheet></Workbook>`;
    this.downloadFile(xml, 'application/vnd.ms-excel', 'xls');
    this.logExportToServer();
  }

  exportPrint() {
    this.isOpen = false;
    this.cd.markForCheck();
    
    setTimeout(() => {
      window.print();
      this.logExportToServer();
    }, 100);
  }

  private downloadFile(content: any, type: string, ext: string) {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.fileName}_${new Date().toISOString().split('T')[0]}.${ext}`;
    link.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    this.isOpen = false;
    this.cd.markForCheck();
  }
}