import { css } from '@emotion/react';
import { theme } from '@expo/styleguide';
import NextLink from 'next/link';
import { CSSProperties, forwardRef, PropsWithChildren, MouseEvent } from 'react';

import { durations } from '~/ui/foundations/durations';

export type LinkProps = PropsWithChildren<{
  target?: string;
  tabIndex?: number;
  href?: string;
  title?: string;
  rel?: string;
  isStyled?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  testID?: string;
  style?: CSSProperties;
  className?: string;
  openInNewTab?: boolean;
  ariaLabel?: string;
}>;

export const LinkBase = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const { href, openInNewTab = false } = props;
  const relProp = props.target === '_blank' && !props.rel ? 'noopener' : props.rel;

  return (
    <NextLink
      href={href ?? ''}
      ref={ref}
      aria-label={props.ariaLabel}
      css={props.isStyled ? linkStyle : undefined}
      className={props.className}
      title={props.title}
      style={props.style}
      onClick={props.onClick}
      tabIndex={props.tabIndex}
      data-testid={props.testID}
      target={openInNewTab ? '_blank' : props.target}
      rel={openInNewTab ? 'noopener noreferrer' : relProp}>
      {props.children}
    </NextLink>
  );
});

const linkStyle = css({
  textDecoration: 'none',
  cursor: 'pointer',
  opacity: 1,
  ':hover': {
    transition: durations.hover,
    opacity: 0.8,
  },
  ':visited': {
    color: theme.link.default,
  },
});
