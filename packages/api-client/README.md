# @monorepo-kit/api-client

Angular HTTP client services for the monorepo.

## Installation

This package is part of the monorepo and can be imported using:

```typescript
import { ApiClientModule, ExampleApiService } from '@monorepo-kit/api-client';
```

## Setup

### 1. Import the module in your Angular app:

```typescript
// app.module.ts
import { ApiClientModule } from '@monorepo-kit/api-client';

@NgModule({
  imports: [
    // Basic import
    ApiClientModule,

    // Or with configuration
    ApiClientModule.forRoot({
      baseUrl: 'https://api.example.com',
      timeout: 30000,
      retryCount: 3,
      enableLogging: true,
    }),
  ],
})
export class AppModule {}
```

### 2. Use in your components or services:

```typescript
import { ExampleApiService } from '@monorepo-kit/api-client';
import { ExampleDto } from '@monorepo-kit/types';

@Component({...})
export class MyComponent {
  constructor(private exampleApi: ExampleApiService) {}

  loadExamples(): void {
    this.exampleApi.getAll().subscribe(examples => {
      console.log('Examples:', examples);
    });
  }
}
```

## Services

### ExampleApiService

CRUD operations for ExampleDto:

```typescript
// Get all examples
exampleApi.getAll(): Observable<ExampleDto[]>

// Get with name filter
exampleApi.getAll('john'): Observable<ExampleDto[]>

// Get by ID
exampleApi.getById('1'): Observable<ExampleDto>

// Get count
exampleApi.getCount(): Observable<{ count: number }>

// Create
exampleApi.create(newExample): Observable<ExampleDto>

// Update
exampleApi.update('1', updatedData): Observable<ExampleDto>

// Partial update
exampleApi.patchExample('1', changes): Observable<ExampleDto>

// Delete
exampleApi.remove('1'): Observable<void>

// Search with filters
exampleApi.search({
  name: 'john',
  minAge: 25,
  maxAge: 40,
  tags: ['developer']
}): Observable<ExampleDto[]>
```

### BaseApiService

Extend this class to create new API services:

```typescript
import { BaseApiService } from '@monorepo-kit/api-client';

@Injectable()
export class MyApiService extends BaseApiService {
  protected readonly baseUrl = '/api';

  constructor(http: HttpClient) {
    super(http);
  }

  // Use protected methods: get, post, put, patch, delete
  getMyData(): Observable<MyData[]> {
    return this.get<MyData[]>('/my-data');
  }
}
```

### ApiConfigService

Configure API behavior:

```typescript
import { ApiConfigService } from '@monorepo-kit/api-client';

constructor(private apiConfig: ApiConfigService) {
  // Update configuration
  this.apiConfig.setConfig({
    baseUrl: 'https://api.example.com',
    enableLogging: true
  });
}
```

## Features

- **Automatic retry** for failed requests (5xx errors)
- **Error transformation** to user-friendly messages
- **Request/response logging** (configurable)
- **Type-safe** API calls with TypeScript
- **Extensible** base service class
- **Interceptor** for common functionality
- **Configuration service** for runtime settings

## Error Handling

All services automatically handle errors and transform them to user-friendly messages:

```typescript
this.exampleApi.getById('invalid-id').subscribe({
  next: (example) => console.log(example),
  error: (error) => {
    console.log(error.userMessage); // User-friendly message
    console.log(error.status); // HTTP status code
    console.log(error.originalError); // Original error
  },
});
```

## Configuration Options

```typescript
interface ApiConfig {
  baseUrl: string; // API base URL (default: '/api')
  timeout?: number; // Request timeout in ms (default: 30000)
  retryCount?: number; // Retry attempts (default: 3)
  enableLogging?: boolean; // Enable request logging (default: false)
}
```
