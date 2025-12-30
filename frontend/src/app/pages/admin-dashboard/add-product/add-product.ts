import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroXMark,
  heroPhoto,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroXMark,
      heroPhoto,
    }),
  ],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {
  @Output() close = new EventEmitter<void>();
  @Output() productAdded = new EventEmitter<any>();

  productForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      stock: ['', [Validators.required, Validators.min(0)]],
      image: [null],
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.productForm.patchValue({ image: file });

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.productForm.patchValue({ image: null });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const productData = this.productForm.value;
      // Here you would typically send to backend
      console.log('Product data:', productData);
      this.productAdded.emit(productData);
      this.close.emit();
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
