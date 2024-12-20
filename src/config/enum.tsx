export enum Direction {
  LeftToRight = 'ltr',
  Center = 'center',
  RightToLeft = 'rtl'
}

export enum Structure {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

export enum Items {
  Single = 'single',
  Multiple = 'multiple'
}

export enum EventTypes {
  All = 0,
  // Page = 1,
  Purchase = 1,
  CartAbandon = 2
}

export enum AddProductCatalogType {
  Static = 'static',
  Dynamic = 'dynamic'
}

export enum ProductDetails {
  Image = '#productsrc#',
  Name = '#name#',
  Description = '#description#',
  Price = '#price#'
}

export enum PermissionTypes {
  Admin = 'Admin',
  LimitedAccess = 'LimitedAccess',
  ReadOnly = 'ReadOnly'
}