Adding support for prefix and sufix

```
  const inputRadiusClass = prefix && suffix
    ? 'rounded-none'
    : prefix
      ? 'rounded-r-md rounded-l-none'
      : suffix
        ? 'rounded-l-md rounded-r-none'
        : radius ? `rounded-${radius}` : 'rounded-md';
```
