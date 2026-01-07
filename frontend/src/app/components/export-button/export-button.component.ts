import { Component, Input, HostListener, inject, ChangeDetectorRef, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private eRef = inject(ElementRef);
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  private baseUrl = 'http://54.253.18.25:5000/api/auth';
  private token = localStorage.getItem('token');

  isOpen = false;

  // --- Dropdown toggle ---
  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    this.cd.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target as HTMLElement)) {
      this.isOpen = false;
      this.cd.markForCheck();
    }
  }

  // --- Backend Logging ---
  private logExportToServer() {
    if (!this.token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    // Log export
    this.http.post(`${this.baseUrl}/export-log`, {}, { headers }).subscribe({
      next: () => console.log('Export logged successfully'),
      error: (err) => console.error('Failed to log export', err),
    });

    // Optional: fetch inventory export (backend triggers notification)
    this.http.get(`${this.baseUrl}/export-inventory`, { headers }).subscribe();
  }

  // --- CSV Export ---
  exportCSV() {
    if (!this.data?.length) {
      this.alertService.show('No data available to export', 'warning');
      return;
    }

    this.alertService.show('Generating CSV...', 'info');

    const headers = ['Name', 'Category', 'Price', 'Stock', 'Status'];
    const rows = this.data.map((item) => [
      `"${item.name?.replace(/"/g, '""') || ''}"`,
      `"${typeof item.category === 'object' ? item.category.name : item.category || ''}"`,
      item.price ?? 0,
      item.stock ?? 0,
      item.stock < 10 ? 'Low Stock' : 'In Stock',
    ]);

    const content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    this.downloadFile(content, 'text/csv', 'csv');
    this.logExportToServer();
  }

  // --- Excel Export (XML Spreadsheet) ---
  exportExcel() {
    if (!this.data?.length) {
      this.alertService.show('No data available to export', 'warning');
      return;
    }

    this.alertService.show('Preparing Excel file...', 'info');

    let xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">`;
    xml += `<Styles><Style ss:ID="s1"><Font ss:Bold="1"/></Style></Styles>`;
    xml += `<Worksheet ss:Name="Inventory"><Table>`;
    xml += `<Row ss:StyleID="s1"><Cell><Data Type="String">Name</Data></Cell><Cell><Data Type="String">Category</Data></Cell><Cell><Data Type="String">Stock</Data></Cell></Row>`;

    this.data.forEach((item) => {
      const category = typeof item.category === 'object' ? item.category.name : item.category || '';
      xml += `<Row>
                <Cell><Data Type="String">${item.name}</Data></Cell>
                <Cell><Data Type="String">${category}</Data></Cell>
                <Cell><Data Type="Number">${item.stock}</Data></Cell>
              </Row>`;
    });

    xml += `</Table></Worksheet></Workbook>`;

    this.downloadFile(xml, 'application/vnd.ms-excel', 'xls');
    this.logExportToServer();
  }

  // --- Print Export ---
  exportPrint() {
    if (!this.data?.length) {
      this.alertService.show('No data to print', 'warning');
      return;
    }

    this.isOpen = false;
    this.cd.markForCheck();

    setTimeout(() => {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) return;

      const tableRows = this.data.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${typeof item.category === 'object' ? item.category.name : item.category}</td>
          <td>${item.price ?? 0}</td>
          <td>${item.stock ?? 0}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>${this.fileName}</title>
            <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background-color: #f3f3f3; }
            </style>
          </head>
          <body>
            <h2>${this.fileName}</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();

      this.logExportToServer();
    }, 100);
  }

  // --- Helper to download any file ---
  private downloadFile(content: string | Blob, type: string, ext: string) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: `${type};charset=utf-8;` });
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
