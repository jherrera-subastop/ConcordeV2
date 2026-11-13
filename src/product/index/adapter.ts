// This package is the only app-facing boundary to Concorde. The V2 files it
// exports were installed verbatim from the official registry and locked in the
// V2 source manifest; route code never imports the library directly.
export { default as Header } from "./concorde/bloques/header/desktop/Header";
export type { HeaderProps } from "./concorde/bloques/header/desktop/Header";

export { default as Sidebar } from "./concorde/bloques/sidebar/desktop/Sidebar";
export type { SidebarNavItem, SidebarProps } from "./concorde/bloques/sidebar/desktop/Sidebar";

export { default as PromoBanner } from "./concorde/bloques/banners/desktop/PromoBanner";
export type { PromoBannerProps, PromoLayout, PromoTone } from "./concorde/bloques/banners/desktop/PromoBanner";

export { default as OfferShelf } from "./concorde/components/OfferShelf";
export type { OfferShelfItem, OfferShelfProps } from "./concorde/components/OfferShelf";
export { default as Homepage } from "./concorde/bloques/homepage/desktop/Homepage";
export { HOMEPAGE_WIDTH, HOMEPAGE_HEIGHT } from "./concorde/bloques/homepage/desktop/dimensions";
export { default as AuctioneerSection } from "./concorde/bloques/homepage/desktop/AuctioneerSection";
export type { AuctioneerSectionProps } from "./concorde/bloques/homepage/desktop/AuctioneerSection";
export type { HomepageProps } from "./concorde/bloques/homepage/desktop/Homepage";
export { default as HomepageMobile } from "./concorde/bloques/homepage/mobile/HomepageMobile";
export type { HomepageMobileProps } from "./concorde/bloques/homepage/mobile/HomepageMobile";
export { default as CategoriesSection } from "./concorde/bloques/homepage/desktop/CategoriesSection";
export type { CategoriesSectionProps } from "./concorde/bloques/homepage/desktop/CategoriesSection";

export { default as Button, UserIcon } from "./concorde/components/Button";
export type { ButtonProps } from "./concorde/components/Button";
export { default as BadgeStatus } from "./concorde/components/BadgeStatus";
export type { BadgeStatusProps } from "./concorde/components/BadgeStatus";
export { default as LikeButton } from "./concorde/components/LikeButton";
export type { LikeButtonProps } from "./concorde/components/LikeButton";
export { default as OfferCard } from "./concorde/components/OfferCard";
export type { OfferCardProps } from "./concorde/components/OfferCard";
export { default as OfferType } from "./concorde/components/OfferType";
export type { OfferTypeProps } from "./concorde/components/OfferType";
export { default as CategoryCard } from "./concorde/components/CategoryCard";
export type { CategoryCardProps } from "./concorde/components/CategoryCard";
export { default as CardTitle } from "./concorde/components/CardTitle";
export type { CardTitleProps } from "./concorde/components/CardTitle";
export { default as ProfileButton } from "./concorde/components/ProfileButton";
export type { ProfileButtonProps } from "./concorde/components/ProfileButton";
export {
  default as SidebarMobile,
  HamburgerIcon,
  SidebarMenuButton,
} from "./concorde/bloques/sidebar/mobile/SidebarMobile";
export type { SidebarMobileProps } from "./concorde/bloques/sidebar/mobile/SidebarMobile";
