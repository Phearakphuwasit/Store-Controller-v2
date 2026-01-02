import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { ProductService, Product } from '../../../services/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './add-product.component.html',
})
export class AddProductComponent {
  @Output() productAdded = new EventEmitter<Product>();
  @Output() close = new EventEmitter<void>();
  imagePreview: string | ArrayBuffer | null = null;
  productForm!: FormGroup;
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // ✅ Save the file for submission
    this.selectedFile = file;

    // ✅ Optional: generate preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.productForm.invalid || this.isLoading) return;

    this.isLoading = true;

    const formData = new FormData();
    formData.append('name', this.productForm.value.name);
    formData.append('description', this.productForm.value.description);
    formData.append('category', this.productForm.value.category);
    formData.append('price', this.productForm.value.price.toString());
    formData.append('stock', this.productForm.value.stock.toString());
    if (this.selectedFile) {
      formData.append('productImage', this.selectedFile, this.selectedFile.name);
    }

    this.productService.createProduct(formData).subscribe({
      next: (res: any) => {
        const product = res.product;
        this.productAdded.emit(product);
        this.isLoading = false;
        this.onClose();
      },
      error: (err) => {
        console.error('Create product failed', err.error || err);
        this.isLoading = false;
      },
    });
  }

  onClose() {
    this.close.emit();
  }
}
