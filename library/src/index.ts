import 'virtual:yarcl.css';
import './styles.css';

export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';
export { Input } from './components/Input';
export type { InputProps } from './components/Input';
export type { Size, Radius, Color, Spacing, Shadow, TextStyle, TokenProps } from './types';
/** The resolved design system config: the consumer's, or the library default. */
export { default as config } from '@yarcl/config';
