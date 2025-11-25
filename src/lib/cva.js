export function cva(base, config = {}) {
  return (options = {}) => {
    const classes = [base];
    const variants = config.variants || {};
    const defaultVariants = config.defaultVariants || {};
    const values = { ...defaultVariants, ...options };

    Object.keys(variants).forEach((variantKey) => {
      const variantOptions = variants[variantKey];
      const variantValue = values[variantKey];
      if (variantValue && variantOptions && variantOptions[variantValue]) {
        classes.push(variantOptions[variantValue]);
      }
    });

    return classes.filter(Boolean).join(" ");
  };
}
