# Dark Theme Toggle System

This application now includes a performant dark theme toggle system that can be easily controlled by adding/removing a CSS class on the document body.

## How It Works

The theme system uses CSS scoping to apply dark theme styles only when the `dark-theme` class is present on the document body:

```html
<!-- Light theme (default) -->
<body>
  <!-- Application content -->
</body>

<!-- Dark theme -->
<body class="dark-theme">
  <!-- Application content with dark theme applied -->
</body>
```

## Usage

### 1. Theme Service

Use the `ThemeService` to programmatically control the theme:

```typescript
import { ThemeService } from './core/services/theme.service';

constructor(private themeService: ThemeService) {}

// Toggle theme
toggleTheme() {
  this.themeService.toggleTheme();
}

// Set specific theme
setDarkTheme() {
  this.themeService.setTheme('dark');
}

setLightTheme() {
  this.themeService.setTheme('light');
}

// Check current theme
isDarkMode() {
  return this.themeService.isDark();
}

// Subscribe to theme changes
ngOnInit() {
  this.themeService.theme$.subscribe(theme => {
    console.log('Current theme:', theme);
  });
}
```

### 2. Theme Toggle Component

Use the pre-built toggle component in your templates:

```html
<!-- Default size -->
<app-theme-toggle></app-theme-toggle>

<!-- Small size (perfect for headers) -->
<app-theme-toggle size="small"></app-theme-toggle>
```

### 3. Manual Toggle

You can also manually control the theme by adding/removing the class:

```typescript
// Enable dark theme
document.body.classList.add('dark-theme');

// Disable dark theme
document.body.classList.remove('dark-theme');
```

## Features

- ✅ **Persistent**: Theme preference is saved to localStorage
- ✅ **System Preference**: Automatically detects system dark/light mode preference
- ✅ **Performance Optimized**: Uses CSS scoping instead of runtime style switching
- ✅ **Smooth Transitions**: Includes optimized CSS transitions for theme switching
- ✅ **Comprehensive Coverage**: Styles all major ng-zorro components
- ✅ **Accessible**: Includes proper scrollbar styling for dark theme

## Performance Benefits

This approach is highly performant because:

1. **No Runtime Calculations**: All theme styles are pre-compiled in CSS
2. **CSS Scoping**: Uses efficient CSS selector scoping instead of dynamic style injection
3. **Hardware Acceleration**: Uses `will-change` and `transform` properties for smooth transitions
4. **Optimized Selectors**: Targets specific components instead of using universal selectors
5. **Single Reflow**: Theme change only requires adding/removing one CSS class

## Adding the Toggle to Your Components

The theme toggle has been integrated into the header component, but you can add it anywhere:

```typescript
// Import in your module
import { SharedModule } from '../shared/shared.module';

// Use in template
<app-theme-toggle></app-theme-toggle>
```

## Customization

To customize dark theme colors, edit `/assets/styles/theme-dark-scoped.less` and update the CSS custom properties:

```less
body.dark-theme {
  --primary-color: #01a9a2; // Your brand color
  --background-color: #121212; // Dark background
  --text-color: #e0e0e0; // Light text
  // ... other custom properties
}
```
