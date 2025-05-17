import { Button } from './Button';

const variants = ['solid', 'outlined', 'ghost', 'link'] as const;
const colors = ['primary', 'secondary', 'neutral', 'accent', 'success', 'danger', 'warning', 'info'] as const;
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const radii = ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'full'] as const;

export default function Debug() {
  return (
    <div className="space-y-8 p-4">
      <h2 className="text-xl font-bold">Button Variants & Colors</h2>
      <div className="space-y-6">
        {variants.map(variant => (
          <div key={variant}>
            <div className="mb-2 font-semibold capitalize">{variant}</div>
            <div className="flex flex-wrap gap-4">
              {colors.map(color => (
                <Button key={color} variant={variant} color={color}>
                  {color}
                </Button>
              ))}
              {colors.map(color => (
                <Button key={color + '-disabled'} variant={variant} color={color} disabled>
                  {color} (disabled)
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-8">Buttons with Icon & Text</h2>
      <div className="flex flex-wrap gap-4">
        {variants.map(variant =>
          colors.map(color => (
            <Button
              key={variant + color + '-icon-text'}
              variant={variant}
              color={color}
              icon={<span role="img" aria-label="star">⭐</span>}
              iconPosition="left"
            >
              {color}
            </Button>
          ))
        )}
      </div>
      <h2 className="text-xl font-bold mt-8">Button Sizes</h2>
      <div className="flex flex-wrap gap-4 items-end">
        {sizes.map(size => (
          <Button key={size} size={size} color="primary">
            {size}
          </Button>
        ))}
        {sizes.map(size => (
          <Button key={size + '-icon'} size={size} color="primary" icon={<span role="img" aria-label="star">⭐</span>} aria-label={size + ' icon'} />
        ))}
      </div>
      <h2 className="text-xl font-bold mt-8">Button Radius</h2>
      <div className="flex flex-wrap gap-4 items-end">
        {radii.map(radius => (
          <Button key={radius} radius={radius} color="primary">
            {radius}
          </Button>
        ))}
        {radii.map(radius => (
          <Button key={radius + '-icon'} radius={radius} color="primary" icon={<span role="img" aria-label="star">⭐</span>} aria-label={radius + ' icon'} />
        ))}
      </div>
    </div>
  );
}