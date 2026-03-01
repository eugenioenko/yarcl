import { ButtonDemo } from './demos/ButtonDemo';
import { FlagsDemo } from './demos/FlagsDemo';
import { I18nDemo } from './demos/I18nDemo';
import { EnvDemo } from './demos/EnvDemo';
import { divider } from './demos/shared';

export function App() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '720px' }}>
      <h1 style={{ margin: 0 }}>config-to-types pipeline</h1>
      <ButtonDemo />
      {divider}
      <FlagsDemo />
      {divider}
      <I18nDemo />
      {divider}
      <EnvDemo />
    </div>
  );
}
