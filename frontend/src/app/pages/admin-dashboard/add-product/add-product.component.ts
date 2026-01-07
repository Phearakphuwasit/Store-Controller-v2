import { Component, EventEmitter, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { ProductService, Product } from '../../../services/product.service';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './add-product.component.html',
})
export class AddProductComponent implements OnInit {
  @Output() productAdded = new EventEmitter<Product>();
  @Output() close = new EventEmitter<void>();

  productForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isLoading = false;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
    });

    this.loadCategories();
  }

  // Load categories from backend
  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.cd.markForCheck();
      },
      error: (err) => console.error('Failed to load categories:', err),
    });
  }

  // Handle image selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      this.cd.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  // Submit form
  onSubmit(): void {
  if (this.productForm.invalid || this.isLoading) {
    this.productForm.markAllAsTouched();
    return;
  }

  this.isLoading = true;

  const formData = new FormData();
  const { name, description, category, price, stock } = this.productForm.value;

  formData.append('name', name);
  formData.append('description', description);
  formData.append('category', category); // category ID
  formData.append('price', String(price));
  formData.append('stock', String(stock));

  if (this.selectedFile) {
    formData.append('productImage', this.selectedFile); // match backend field name
  }

  // Debugging: log FormData
  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  this.productService.createProduct(formData).subscribe({
    next: (res: any) => {
      console.log('Product created successfully:', res);
      alert('Product created successfully!');
      this.productForm.reset({
        name: '',
        description: '',
        category: '',
        price: 0,
        stock: 0
      });
      this.selectedFile = null;
      this.imagePreview = null;
      this.isLoading = false;
      this.productAdded.emit(res.product);
      this.onClose();
    },
    error: (err) => {
      console.error('Failed to create product:', err);
      alert(err.error?.message || 'Failed to create product');
      this.isLoading = false;
    },
  });
}

  onClose() {
    this.close.emit();
  }
}
