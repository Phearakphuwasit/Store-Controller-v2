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
  @Output() productAdded = new EventEmitter<Product>(); // ✅ MUST be Product
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
    if (this.selectedFile) formData.append('productImage', this.selectedFile);

    this.productService.createProduct(formData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const product: Product = res.product || res.data || res; // ✅ ensure Product type
        this.productAdded.emit(product); // ✅ emit Product
        this.onClose();
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.isLoading = false;
      },
    });
  }

  onClose() {
    this.close.emit();
  }
}
