import { useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ComponentProps, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx, paddingClass } from '../classes';
import { useControllable } from '../hooks';
import { NavigationContext } from '../navigation';
import { useConfig, useDefaults } from '../runtime';
import type { Breakpoint, Spacing, Width } from '../types';
import { IconButton } from './IconButton';
import { Modal } from './Modal';

/** Props for {@link AppLayout}. */
export interface AppLayoutProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Navigation links or sections, mounted once across desktop and mobile modes. */
  navigation: ReactNode;
  /** Accessible name of the navigation and visible title of its mobile drawer. */
  navigationLabel: string;
  /** Top navbar content, displayed beside the mobile menu button. */
  navbar?: ReactNode;
  /** Footer content, kept outside the scrolling main area. */
  footer?: ReactNode;
  /** Main content, which scrolls independently of the navbar and footer. */
  children?: ReactNode;
  /** Breakpoint key at and above which the sidebar stays visible. */
  desktopBreakpoint: Breakpoint;
  /** Width key for the expanded desktop sidebar and mobile drawer. */
  sidebarWidth: Width;
  /** Collapses desktop navigation to an icon rail. Mobile navigation stays expanded. @default false */
  collapsed?: boolean;
  /** Spacing inside the navbar, navigation, main area and footer. @default config.components.AppLayout.padding ?? config.defaults.padding */
  padding?: Spacing;
  /** Accessible name of the mobile menu button. @default navigationLabel */
  menuLabel?: string;
  /** Accessible name of the mobile drawer's close button. @default config.labels.close */
  closeLabel?: string;
  /** Text for an optional skip link, shown when keyboard focused. */
  skipLabel?: string;
  /** Controlled mobile drawer state. Desktop navigation remains visible. */
  navigationOpen?: boolean;
  /** Initial mobile drawer state. @default false */
  defaultNavigationOpen?: boolean;
  /** Called when the mobile drawer opens or closes, including a desktop transition. */
  onNavigationOpenChange?: (open: boolean) => void;
  /** Native attributes, ref and scroll handlers for the main content element. */
  mainProps?: ComponentProps<'main'>;
  /** Main content element. Use section when embedding a layout within another main landmark. @default 'main' */
  mainAs?: 'main' | 'section';
}

function useDesktop(query: string) {
  const media = useMemo(() => typeof window === 'undefined' ? null : window.matchMedia(query), [query]);
  const subscribe = useCallback((callback: () => void) => {
    media?.addEventListener('change', callback);
    return () => media?.removeEventListener('change', callback);
  }, [media]);
  return useSyncExternalStore(subscribe, () => media?.matches ?? false, () => false);
}

/**
 * A responsive application frame with persistent navigation and independently scrolling content.
 * @example
 * ```tsx
 * <AppLayout desktopBreakpoint="lg" sidebarWidth="sidebar" navigationLabel="Workspace"
 *   navigation={<NavSection title="Work"><NavItem href="/projects">Projects</NavItem></NavSection>}
 *   navbar={<Text>Acme</Text>} footer={<Text>Help and support</Text>}>
 *   <Heading level={1}>Projects</Heading>
 * </AppLayout>
 * ```
 */
export function AppLayout({ navigation, navigationLabel, navbar, footer, children, desktopBreakpoint, sidebarWidth, collapsed = false, padding, menuLabel, closeLabel, skipLabel, navigationOpen, defaultNavigationOpen = false, onNavigationOpenChange, mainProps, mainAs: Main = 'main', className, ...props }: AppLayoutProps) {
  const config = useConfig();
  const own = useDefaults('AppLayout');
  const desktop = useDesktop(`(min-width: ${config.breakpoints[desktopBreakpoint]})`);
  const [open, setOpen] = useControllable(navigationOpen, defaultNavigationOpen, onNavigationOpenChange);
  const id = useId();
  const mainId = mainProps?.id ?? `${id}-main`;
  const navigationId = `${id}-navigation`;
  const menu = useRef<HTMLButtonElement>(null);
  const main = useRef<HTMLElement>(null);
  const nav = useRef<HTMLElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const previousDesktop = useRef(desktop);
  useEffect(() => {
    const element = document.createElement('div');
    element.className = 'yarcl-app-layout-navigation-host';
    setHost(element);
  }, []);
  useLayoutEffect(() => {
    const target = desktop ? sidebar.current : drawer.current;
    if (host && target) target.appendChild(host);
    return () => { host?.remove(); };
  }, [desktop, host]);
  useImperativeHandle(mainProps?.ref, () => main.current!, [Main]);

  useEffect(() => {
    const changed = desktop !== previousDesktop.current;
    previousDesktop.current = desktop;
    if (desktop && open) setOpen(false);
    const active = document.activeElement;
    const dialog = nav.current?.closest('dialog');
    if (!desktop && !open && active && (dialog?.contains(active) || (changed && active === document.body))) menu.current?.focus();
    if (desktop && changed && (active === menu.current || active === document.body || (active instanceof HTMLElement && dialog?.contains(active) && active.getClientRects().length === 0))) main.current?.focus();
  }, [desktop, open, setOpen]);

  function navigate(event: MouseEvent<HTMLElement>) {
    if (desktop || !open || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (link && !link.hasAttribute('download') && (!link.getAttribute('target') || link.getAttribute('target') === '_self')) setOpen(false);
  }

  return (
    <div data-part="root" data-desktop={desktop || undefined} data-collapsed={collapsed || undefined} className={cx('yarcl-root yarcl-app-layout', `yarcl-app-width-${sidebarWidth}`, paddingClass(padding ?? own.padding), className)} {...props}>
      {skipLabel != null && <a className="yarcl-visually-hidden yarcl-app-layout-skip" href={`#${mainId}`} onClick={(event) => { event.preventDefault(); main.current?.focus(); }}>{skipLabel}</a>}
      <header data-part="navbar" className="yarcl-app-layout-navbar">
        <IconButton ref={menu} className="yarcl-app-layout-menu" aria-label={menuLabel ?? navigationLabel} aria-expanded={!desktop && open} aria-controls={navigationId} aria-haspopup="dialog" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </IconButton>
        <div className="yarcl-app-layout-navbar-content">{navbar}</div>
      </header>
      <aside ref={sidebar} data-part="sidebar" className="yarcl-app-layout-sidebar" />
      <Modal slotComponent="Drawer" className="yarcl-drawer yarcl-drawer-left yarcl-app-layout-drawer" id={navigationId} title={navigationLabel} closeLabel={closeLabel} open={!desktop && open} onOpenChange={setOpen} keepMounted>
        <div ref={drawer} className="yarcl-app-layout-navigation-mount" />
      </Modal>
      {host && createPortal(<NavigationContext value={desktop && collapsed}>
        <nav ref={nav} data-part="navigation" aria-label={navigationLabel} className="yarcl-app-layout-navigation" onClick={navigate}>{navigation}</nav>
      </NavigationContext>, host)}
      <Main {...mainProps} ref={main} id={mainId} tabIndex={mainProps?.tabIndex ?? -1} data-part="main" className={cx('yarcl-app-layout-main', mainProps?.className)}>{children}</Main>
      {footer != null && <footer data-part="footer" className="yarcl-app-layout-footer">{footer}</footer>}
    </div>
  );
}
