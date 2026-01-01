import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // Fixes *ngIf
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Fixes [formGroup]
import { NgIconComponent } from '@ng-icons/core'; // Fixes <ng-icon>
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './add-product.component.html',
})
export class AddProductComponent {
  // Ensure the class name is exactly this
  @Output() productAdded = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  productForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isLoading = false;

  constructor(private fb: FormBuilder, private productService: ProductService) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.isLoading = true;
    const formData = new FormData();
    Object.keys(this.productForm.value).forEach((key) => {
      formData.append(key, this.productForm.value[key]);
    });

    if (this.selectedFile) {
      formData.append('productImage', this.selectedFile);
    }

    this.productService.createProduct(formData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        // Pass the product from the response back to the dashboard
        this.productAdded.emit(res.product);
        this.onClose();
      },
      error: (err: any) => {
        console.error('Upload failed', err);
        this.isLoading = false;
      },
    });
  }

  onClose() {
    this.close.emit();
  }
}
