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

export enum CreditHistoryType {
  All = -1,
  Email = 0,
  SMS = 1,
  MMS = 2
}

export enum CreditHistoryAccountType {
  All = -1,
  Standard = 0,
  Direct = 1
}