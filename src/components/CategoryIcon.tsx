import type { SVGProps } from 'react';
import { Wheat, Sprout, FlaskConical, Boxes } from 'lucide-react';
import { InventoryCategory } from '../types';

interface CategoryIconProps extends SVGProps<SVGSVGElement> {
  category: InventoryCategory;
  className?: string;
}

export function CategoryIcon({ category, className, ...props }: CategoryIconProps) {
  switch (category) {
    case 'Malts':
      return <Wheat className={className} {...props} />;
    case 'Hops':
      return <Sprout className={className} {...props} />;
    case 'Yeast':
      return <FlaskConical className={className} {...props} />;
    case 'Misc':
      return <Boxes className={className} {...props} />;
    default:
      return <Boxes className={className} {...props} />;
  }
}
