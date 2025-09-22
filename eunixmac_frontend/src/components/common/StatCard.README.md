# Enhanced Stat Cards Documentation

## Overview

The Enhanced Stat Cards system provides a modern, responsive, and accessible way to display key metrics and statistics across the platform. It consists of two main components:

1. **EnhancedStatCard** - Individual stat card component
2. **StatCardsContainer** - Responsive grid container for stat cards

## Features

### 🎨 Modern Design
- Clean, modern aesthetic with subtle gradients
- Smooth animations and hover effects
- Consistent spacing and typography
- Professional color schemes

### 📱 Fully Responsive
- Mobile-first design approach
- Adaptive layouts for all screen sizes
- Touch-friendly on mobile devices
- Optimized for both portrait and landscape orientations

### ♿ Accessibility
- ARIA attributes for screen readers
- Keyboard navigation support
- High contrast mode support
- Proper focus management

### ⚡ Performance
- Optimized CSS with efficient animations
- Reduced motion support for users with vestibular disorders
- Minimal bundle size impact

## Usage

### Basic Example

```jsx
import EnhancedStatCard from '../components/common/EnhancedStatCard';
import StatCardsContainer from '../components/common/StatCardsContainer';
import { Store, TrendingUp, Visibility, Message } from '@mui/icons-material';

function Dashboard() {
  return (
    <StatCardsContainer
      columns={{ mobile: 1, tablet: 2, desktop: 4 }}
      gap="16px"
    >
      <EnhancedStatCard
        icon={Store}
        value={1234}
        label="Total Ads"
        color="#3b82f6"
        size="medium"
      />

      <EnhancedStatCard
        icon={TrendingUp}
        value={856}
        label="Active Ads"
        color="#10b981"
        size="medium"
        trend="+12.5%"
        trendDirection="up"
      />

      <EnhancedStatCard
        icon={Visibility}
        value={45678}
        label="Total Views"
        color="#06b6d4"
        size="medium"
        onClick={() => console.log('Navigate to analytics')}
      />

      <EnhancedStatCard
        icon={Message}
        value={23}
        label="New Messages"
        color="#f59e0b"
        size="medium"
        loading={false}
      />
    </StatCardsContainer>
  );
}
```

## Component Props

### EnhancedStatCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | Component | - | Material-UI icon component |
| `value` | string/number | - | The main statistic value |
| `label` | string | - | Descriptive label for the statistic |
| `color` | string | `#3b82f6` | Primary color (hex format) |
| `bgColor` | string | - | Custom background color |
| `onClick` | function | - | Click handler (makes card clickable) |
| `loading` | boolean | `false` | Show loading skeleton |
| `trend` | string | - | Trend indicator text (e.g., "+5.2%") |
| `trendDirection` | string | `up` | Trend direction: `up`, `down`, `neutral` |
| `variant` | string | `default` | Visual variant: `default`, `compact`, `detailed` |
| `size` | string | `medium` | Size variant: `small`, `medium`, `large` |

### StatCardsContainer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Stat card components |
| `className` | string | - | Additional CSS classes |
| `columns` | object | `{mobile: 1, tablet: 2, desktop: 4}` | Responsive column configuration |
| `gap` | string | `16px` | Gap between cards |

## Size Variants

### Small
- Ideal for compact dashboards
- Minimum height: 100px
- Smaller icons and text

### Medium (Default)
- Balanced size for most use cases
- Minimum height: 130px
- Standard proportions

### Large
- For prominent metrics
- Minimum height: 160px
- Larger icons and text

## Color Guidelines

### Recommended Colors

```css
/* Blue - Primary actions, general stats */
#3b82f6

/* Green - Success, positive metrics */
#10b981

/* Cyan - Information, neutral data */
#06b6d4

/* Orange - Warnings, pending items */
#f59e0b

/* Red - Errors, urgent items */
#ef4444

/* Purple - Special features */
#8b5cf6
```

## Responsive Breakpoints

| Breakpoint | Screen Size | Default Columns |
|------------|-------------|-----------------|
| Mobile | < 640px | 1 |
| Tablet | 640px - 1023px | 2 |
| Desktop | ≥ 1024px | 4 |

## Loading States

The component includes built-in skeleton loading states:

```jsx
<EnhancedStatCard
  icon={Store}
  value={0}
  label="Loading..."
  loading={true}
/>
```

## Clickable Cards

Make cards interactive by providing an `onClick` handler:

```jsx
<EnhancedStatCard
  icon={Store}
  value={1234}
  label="Total Ads"
  color="#3b82f6"
  onClick={() => navigate('/ads')}
/>
```

## Trend Indicators

Add trend indicators to show changes over time:

```jsx
<EnhancedStatCard
  icon={TrendingUp}
  value={856}
  label="Active Ads"
  color="#10b981"
  trend="+12.5%"
  trendDirection="up"
/>
```

## Custom Background Colors

Override the default gradient with custom backgrounds:

```jsx
<EnhancedStatCard
  icon={Store}
  value={1234}
  label="Premium Stats"
  bgColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
/>
```

## Accessibility Features

- **Keyboard Navigation**: Cards are focusable and support Enter/Space activation
- **Screen Reader Support**: Proper ARIA attributes and semantic markup
- **High Contrast**: Automatic adaptation for high contrast mode
- **Reduced Motion**: Respects user's motion preferences

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- CSS animations use `transform` and `opacity` for optimal performance
- Icons are tree-shaken when using Material-UI properly
- Component supports React.memo for re-render optimization

## Migration Guide

### From StatCard (Material-UI)

```jsx
// Old
<StatCard
  icon={Store}
  value={1234}
  label="Total Ads"
  color="primary.main"
/>

// New
<EnhancedStatCard
  icon={Store}
  value={1234}
  label="Total Ads"
  color="#3b82f6"
  size="medium"
/>
```

### From ModernStatCard

```jsx
// Old
<ModernStatCard
  icon={Store}
  value={1234}
  label="Total Ads"
  color="#3b82f6"
/>

// New - No changes needed!
<EnhancedStatCard
  icon={Store}
  value={1234}
  label="Total Ads"
  color="#3b82f6"
  size="medium"
/>
```

## Best Practices

1. **Consistent Colors**: Use the recommended color palette across your application
2. **Meaningful Icons**: Choose icons that clearly represent the data being displayed
3. **Appropriate Sizing**: Use `small` for compact layouts, `medium` for standard, `large` for hero metrics
4. **Loading States**: Always show loading states for async data
5. **Click Affordance**: Only make cards clickable if they lead to more detailed views
6. **Trend Context**: Include trend indicators for time-series data when helpful

## Examples by Use Case

### Admin Dashboard
```jsx
<StatCardsContainer columns={{ mobile: 2, tablet: 2, desktop: 4 }}>
  <EnhancedStatCard icon={People} value={1234} label="Total Users" color="#3b82f6" />
  <EnhancedStatCard icon={Assignment} value={56} label="Pending Reviews" color="#f59e0b" />
  <EnhancedStatCard icon={CheckCircle} value={89} label="Completed Today" color="#10b981" />
  <EnhancedStatCard icon={Warning} value={3} label="Issues" color="#ef4444" />
</StatCardsContainer>
```

### Analytics Section
```jsx
<StatCardsContainer columns={{ mobile: 2, tablet: 2, desktop: 4 }}>
  <EnhancedStatCard
    icon={Visibility}
    value={45678}
    label="Page Views"
    color="#06b6d4"
    trend="+15.3%"
    trendDirection="up"
  />
  <EnhancedStatCard
    icon={Schedule}
    value="2.5m"
    label="Avg. Session"
    color="#8b5cf6"
    trend="+0.2m"
    trendDirection="up"
  />
</StatCardsContainer>
```