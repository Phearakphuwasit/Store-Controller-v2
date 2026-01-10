import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { ProductService, Product, Category } from '../../../services/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './add-product.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProductComponent implements OnInit {
  @Output() productAdded = new EventEmitter<Product>();
  @Output() close = new EventEmitter<void>();
  feedback: { message: string; type: 'success' | 'error' | null } = { message: '', type: null };
  productForm!: FormGroup;
  categories: Category[] = [];

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
    });
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (cats: Category[]) => {
        this.categories = cats;
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        alert('Failed to load categories');
      },
    });
  }

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

  onSubmit(): void {
    if (this.productForm.invalid || this.isLoading) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.cd.markForCheck();

    const formData = this.buildFormData();

    this.productService.createProduct(formData).subscribe({
      next: (res: { product: Product }) => {
        this.handleSuccess(res.product);
      },
      error: (err) => {
        console.error('Create product error:', err);
        this.isLoading = false;
        this.feedback = {
          message: err?.error?.message || 'Critical Error: System failed to save product.',
          type: 'error',
        };
        this.cd.markForCheck();
      },
    });
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    const { name, description, category, price, stock } = this.productForm.value;

    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('category', category);
    formData.append('price', String(price));
    formData.append('stock', String(stock));

    if (this.selectedFile) {
      formData.append('productImage', this.selectedFile);
    }

    return formData;
  }

  private handleSuccess(product: Product): void {
    this.isLoading = false;
    this.feedback = { message: 'Product initialized successfully!', type: 'success' };

    this.productForm.reset({ price: 0, stock: 0 });
    this.selectedFile = null;
    this.imagePreview = null;

    this.productAdded.emit(product);
    setTimeout(() => {
      this.close.emit();
      this.feedback.type = null;
      this.cd.markForCheck();
    }, 2000);

    this.cd.markForCheck();
  }

  onClose(): void {
    this.close.emit();
  }
}
