import { Button } from './button/Button.component';

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
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-bold mt-8">Button Sizes</h2>
      <div className="flex flex-wrap gap-4 items-end">
        {sizes.map(size => (
          <Button key={size} size={size} color="primary">
            {size}
          </Button>
        ))}
      </div>
      <h2 className="text-xl font-bold mt-8">Button Radius</h2>
      <div className="flex flex-wrap gap-4 items-end">
        {radii.map(radius => (
          <Button key={radius} radius={radius} color="primary">
            {radius}
          </Button>
        ))}
      </div>
      <h2 className="text-xl font-bold mt-8">Alerts</h2>
      <div className="bg-primary text-inverse p-4 rounded-lg">
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </div>
      <div className="bg-primary-light text-static-foreground p-4 rounded-lg">
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </div>
      <div className="bg-primary-dark text-inverse p-4 rounded-lg">
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </div>
      <div className="bg-danger text-inverse p-4 rounded-lg">
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </div>
      <div className="bg-danger-light text-foreground p-4 rounded-lg">
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </div>
      <div className="bg-danger-dark text-inverse p-4 rounded-lg">
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </div>
    </div>
  );
}